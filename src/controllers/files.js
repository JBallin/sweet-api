const model = require('../models/files');

const getFiles = async (req, res, next) => {
  const files = await model.getFiles();
  if (files.error) next(files.error);
  else if (files instanceof Error) next(files);
  else res.json(files);
};

module.exports = { getFiles };
