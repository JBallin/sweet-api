const model = require('../models/categories');

const getCategories = async (req, res, next) => {
  const categories = await model.getCategories();
  if (categories.error) next(categories.error);
  else res.json(categories);
};

module.exports = { getCategories };
