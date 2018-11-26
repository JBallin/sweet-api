const model = require('../models/login');

const login = async (req, res, next) => {
  const user = await model.login(req.body);
  if (user.error) next(user.error);
  else res.json(user);
};

module.exports = { login };
