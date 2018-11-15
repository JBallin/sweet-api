const fetch = require('node-fetch');

const gistAPI = 'https://api.github.com/gists';

async function fetchGistFiles(gistID) {
  let files = [];
  if (gistID) {
    const gistFetch = await fetch(`${gistAPI}/${gistID}`);
    const gist = await gistFetch.json();
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
