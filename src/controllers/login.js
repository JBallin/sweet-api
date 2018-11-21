const model = require('../models/login');

const login = async (req, res, next) => {
  const attempt = await model.login(req.body);
  if (attempt.error) next(attempt.error);
  else res.json(attempt);
};

module.exports = { login };
