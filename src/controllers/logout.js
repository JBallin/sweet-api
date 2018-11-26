const errors = require('../utils/errors');

const logout = async (req, res, next) => {
  try {
    res.clearCookie('jwt');
    res.sendStatus(205);
  } catch (e) {
    next(errors.logout(e));
  }
};

module.exports = { logout };
