const bcrypt = require('bcrypt');
const knex = require('../../knex');
const errors = require('../utils/errors');

const login = async ({ email, password }) => {
  let user;
  let isPasswordValid;
  try {
    user = await knex('users').where('email', email.toLowerCase()).first();
    if (!user) return errors.invalidLogin;
  } catch (e) {
    return errors.fetchDB('user', e);
  }
  try {
    isPasswordValid = bcrypt.compareSync(password, user.hashed_pwd);
    if (!isPasswordValid) return errors.invalidLogin;
    const userResponse = { ...user };
    delete userResponse.hashed_pwd;
    return userResponse;
  } catch (e) {
    return errors.bcrypt(e);
  }
const stripHashedPwd = (user) => {
  const userWithoutHashedPwd = { ...user };
  delete userWithoutHashedPwd.hashed_pwd;
  return userWithoutHashedPwd;
};

};

module.exports = { login };
