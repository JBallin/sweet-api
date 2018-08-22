const fetch = require('node-fetch');

const gistAPI = 'https://api.github.com/gists';

async function fetchGistFiles(gistID) {
  let files = [];
  if (gistID) {
    const gistFetch = await fetch(`${gistAPI}/${gistID}`);
    const gist = await gistFetch.json();
    files = Object.keys(gist.files);
  }
  return files;
}

module.exports = fetchGistFiles;
