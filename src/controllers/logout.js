const errors = require('../utils/errors');
const { clearTokenCookie } = require('../utils/auth');

const logout = (req, res, next) => {
  try {
    clearTokenCookie(res);
    res.sendStatus(205);
  } catch (e) {
    next(errors.logout(e));
  }
};

module.exports = { logout };
