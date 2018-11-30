const knex = require('../../knex');
const { fetchGistFiles } = require('../utils/gistAPI');
const errors = require('../utils/errors');
const { getUser } = require('./users');
const { getCategories } = require('./categories');
const { seeds } = require('../../seeds/001users');

const getCategorizedFiles = () => knex('file_types')
  .join('categories', 'file_types.category_id', 'categories.id')
  .select('categories.id AS id', 'categories.title AS category', 'file_types.title AS title', 'file_types.extension AS extension')
  .catch((e) => {
    throw errors.categorizedFilesJoinDB(e);
  });

const getGistFiles = async (gistId) => {
  if (!gistId) throw errors.noGistId;
  const gistFiles = await fetchGistFiles(gistId);
  if (gistFiles.error) throw gistFiles;
  return gistFiles;
};

const getCategoriesTable = async () => {
  const categories = await getCategories();
  if (categories.error) throw categories;
  return categories;
};

const getSeedUserGistId = async () => {
  const user = await getUser(seeds[0].id);
  if (user.error) throw user;
  return user.gist_id;
};

const getFiles = async () => {
  let categorizedFiles;
  let gistFiles;
  let categories;
  const savedFiles = [];

  try {
    const gistId = await getSeedUserGistId();
    const promises = [getCategorizedFiles(), getGistFiles(gistId), getCategoriesTable()];
    [categorizedFiles, gistFiles, categories] = await Promise.all(promises);
  } catch (e) {
    return e;
  }

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

  return files;
};

module.exports = { getFiles };
