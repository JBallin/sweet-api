const model = require('../models/fileTypes');

const getFileTypes = async (req, res, next) => {
  const fileTypes = await model.getFileTypes();
  if (fileTypes.error) next(fileTypes.error);
  else res.json(fileTypes);
};

module.exports = { getFileTypes };
