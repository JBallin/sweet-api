const fetch = require('node-fetch');
const errors = require('./errors');

const gistAPI = 'https://api.github.com/gists';
const { GITHUB_TOKEN } = process.env;
const token = GITHUB_TOKEN ? `access_token=${GITHUB_TOKEN}` : '';

async function fetchGist(gistId) {
  const gistAPIwithIdAndToken = `${gistAPI}/${gistId}?${token}`;
  const gistJSON = await fetch(gistAPIwithIdAndToken);
  const gist = await gistJSON.json();
  const { message } = gist;

  if (message) {
    if (message.includes('rate limit')) {
      return errors.githubAPILimit;
    }
    if (message === 'Not Found') {
      return errors.gistDNE(gistId);
    }
    return errors.gistErr(message);
  }

  return gist;
}

async function fetchGistFiles(gistId) {
  let files = [];
  if (gistId) {
    const gist = await fetchGist(gistId);
    if (gist.error) return gist;
    files = Object.keys(gist.files);
  }
  return files;
}

const validateGist = async (gistId) => {
  if (!gistId) {
    return errors.noGistId;
  }

  const gist = await fetchGist(gistId);
  if (gist.error) {
    return gist;
  }

  const isValid = Boolean(gist.files && gist.files['.MyConfig.md']);
  if (!isValid) {
    return errors.invalidBSGist;
  }
  return { isValid };
};


module.exports = { fetchGistFiles, fetchGist, validateGist };
