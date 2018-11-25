const bcrypt = require('bcrypt');
const knex = require('../../knex');
const { createError } = require('../utils/errors');

const login = async ({ email, password }) => {
  const loginErr = createError(401, 'Invalid credentials. Please try again.');
  let user;
  let isPasswordValid;
  try {
    user = await knex('users').where('email', email.toLowerCase()).first();
    if (!user) return loginErr;
  } catch (e) {
    return createError(500, 'Error fetching users', e);
  }
  try {
    isPasswordValid = bcrypt.compareSync(password, user.hashed_pwd);
    if (!isPasswordValid) return loginErr;
    return { validCredentials: true };
  } catch (e) {
    return createError(500, 'Error authenticating password', e);
  }
};

module.exports = { login };
