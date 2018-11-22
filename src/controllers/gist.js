const gistAPI = require('../utils/gistAPI');

const validateGist = async (req, res, next) => {
  const { gistId } = req.body;
  const isValid = await gistAPI.validateGist(gistId);
  if (isValid.error) next(isValid.error);
  else res.json(isValid);
};

module.exports = { validateGist };
