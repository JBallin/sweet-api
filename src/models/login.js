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
    return { id: user.id, username: user.username };
  } catch (e) {
    return errors.bcrypt(e);
  }
};

module.exports = { login };
