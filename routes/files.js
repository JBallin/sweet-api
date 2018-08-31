const router = require('express').Router();
const knex = require('../knex');
const fetchGistFiles = require('../api/gist');

router.get('/', async (req, res) => {
  const categorizedFiles = await knex('file_types')
    .join('categories', 'file_types.category_id', 'categories.id')
    .select('categories.title AS category', 'file_types.title AS title', 'file_types.extension AS extension');
  const users = await knex('users');
  const gistFiles = await fetchGistFiles(users[0].gist_id);
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
  res.json(files);
});

module.exports = router;
