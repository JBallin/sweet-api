const errors = require('../utils/errors');

const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    res.sendStatus(205);
  } catch (e) {
    next(errors.logout(e));
  }
};

module.exports = { logout };
