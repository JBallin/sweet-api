const router = require('express').Router();
const knex = require('../knex');
const fetchGistFiles = require('../api/gist');

router.get('/', async (req, res) => {
  try {
    const getCategorizedFiles = () => knex('file_types')
      .join('categories', 'file_types.category_id', 'categories.id')
      .select('categories.id AS id', 'categories.title AS category', 'file_types.title AS title', 'file_types.extension AS extension');

    let gistID;
    const getGistFiles = async () => {
      const users = await knex('users');
      gistID = users[0].gist_id;
      if (!gistID) throw new Error('No gist ID provided');
      return fetchGistFiles(gistID);
    };

    const getCategories = () => knex('categories');

    const [categorizedFiles, gistFiles, categories] = await Promise.all([
      getCategorizedFiles(), getGistFiles(), getCategories(),
    ]);

    const files = categorizedFiles.reduce((result, {
      category, title, extension, id,
    }) => {
      const rez = result;
      const newFile = { title, extension };
      const newFileName = title + extension;
      if (gistFiles.includes(newFileName)) {
        const i = rez.findIndex(cat => cat.category === category);
        if (i === -1) {
          const newCategory = {
            id,
            category,
            files: [],
          };
          newCategory.files.push(newFile);
          rez.push(newCategory);
        } else {
          rez[i].files.push(newFile);
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
