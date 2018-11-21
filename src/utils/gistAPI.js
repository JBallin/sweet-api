const fetch = require('node-fetch');
const { createError } = require('./errors');

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
      return createError(500, 'GitHub API rate limit exceeded');
    }
    if (message === 'Not Found') {
      return createError(400, `No gist with id '${gistId}'`);
    }
    return createError(500, 'Error fetching gist', message);
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


module.exports = { fetchGistFiles, isValidGist };
