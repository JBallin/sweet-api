const model = require('../models/login');
const { sendTokenCookie } = require('../utils/auth');

const login = async (req, res, next) => {
  const user = await model.login(req.body);
  if (user.error) next(user.error);
  else {
    sendTokenCookie(user, res);
    res.json({ username: user.username });
  }
};

module.exports = { login };
