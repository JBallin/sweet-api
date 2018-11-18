const router = require('express').Router();
const knex = require('../../knex');
const { fetchGistFiles } = require('../api/gist');
const { createError } = require('../utils/errors');

router.get('/', async (req, res, next) => {
  const getCategorizedFiles = () => knex('file_types')
    .join('categories', 'file_types.category_id', 'categories.id')
    .select('categories.id AS id', 'categories.title AS category', 'file_types.title AS title', 'file_types.extension AS extension');

  let gistID;
  const getGistFiles = async () => {
    const users = await knex('users');
    gistID = users[0].gist_id;
    return fetchGistFiles(gistID);
  };

  const getCategories = () => knex('categories');

  let categorizedFiles;
  let gistFiles;
  let categories;
  try {
    [categorizedFiles, gistFiles, categories] = await Promise.all([
      getCategorizedFiles(), getGistFiles(), getCategories(),
    ]);
  } catch (e) {
    return next(e);
  }

  if (!gistID) return next(createError(400, 'No gist ID provided').error);

  const savedFiles = [];

  const files = categorizedFiles.reduce((result, {
    category, title, extension, id,
  }) => {
    const rez = result;
    const newFile = { title, extension };
    const newFileName = title + extension;
    savedFiles.push(newFileName);
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

  const otherFiles = gistFiles.filter(f => !savedFiles.includes(f));
  const otherFilesParsed = otherFiles.map((file) => {
    let [title, extension, other] = file.split('.'); // eslint-disable-line prefer-const
    if (!title) {
      title = `.${extension}`;
      extension = other;
    }
    return { title, extension: extension ? `.${extension}` : '' };
  });
  const OTHER = 'Other';
  if (otherFiles.length) {
    const { id } = categories.find(c => c.title === OTHER);
    const otherCategory = {
      id,
      category: OTHER,
      files: otherFilesParsed,
    };
    files.push(otherCategory);
  }

  if (files.length) return res.json(files);
  return next(createError(400, 'No files found in gist').error);
});

module.exports = router;
