const fetch = require('node-fetch');

const gistAPI = 'https://api.github.com/gists';
const { GITHUB_TOKEN } = process.env;
const token = GITHUB_TOKEN ? `access_token=${GITHUB_TOKEN}` : '';

async function fetchGist(gistId) {
  const gistJSON = await fetch(`${gistAPI}/${gistId}?${token}`);
  return gistJSON.json();
}

async function fetchGistFiles(gistId) {
  let files = [];
  if (gistId) {
    const gist = await fetchGist(gistId);
    const { message } = gist;
    if (message) {
      if (message.includes('rate limit')) throw Error('GitHub API rate limit exceeded');
      else throw Error(message);
    }
    files = Object.keys(gist.files);
  }
  return files;
}

module.exports = fetchGistFiles;
