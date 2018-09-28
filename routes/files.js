const router = require('express').Router();
const knex = require('../knex');
const fetchGistFiles = require('../api/gist');

router.get('/', async (req, res) => {
  try {
    const getCategorizedFiles = () => knex('file_types')
      .join('categories', 'file_types.category_id', 'categories.id')
      .select('categories.title AS category', 'file_types.title AS title', 'file_types.extension AS extension');

    let gistID;
    const getGistFiles = async () => {
      const users = await knex('users');
      gistID = users[0].gist_id;
      if (!gistID) throw new Error('No gist ID provided');
      return fetchGistFiles(gistID);
    };

    const [categorizedFiles, gistFiles] = await Promise.all([
      getCategorizedFiles(), getGistFiles(),
    ]);

    const files = categorizedFiles.reduce((result, { category, title, extension }) => {
      const rez = result;
      const newFile = { title, extension };
      if (gistFiles.includes(title + extension)) {
        const i = rez.findIndex(e => Object.keys(e)[0] === category);
        if (i === -1) {
          const newCategory = {};
          newCategory[category] = [newFile];
          rez.push(newCategory);
        } else {
          rez[i][category].push(newFile);
        }
      }
      return rez;
    }, []);
    if (files.length) res.json(files);
    else if (!gistID) res.status(400).send('No gist ID provided');
    else res.send('No files found in gist');
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    if (err.message === 'No gist ID provided') res.status(400).send(`Error: ${err.message}`);
    else res.status(500).send('Error fetching DB');
  }
});

module.exports = router;
