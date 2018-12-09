const bcrypt = require('bcrypt');
const knex = require('../../knex');
const errors = require('../utils/errors');

const loginWithTokenId = async (id) => {
  const user = await knex('users').where('id', id).first();
  if (!user) return errors.invalidToken(`No user with id '${id}'`);
  return user;
};

const loginWithCredentials = async ({ email, password }) => {
  let isPasswordValid;
  let user;
  try {
    user = await knex('users').where('email', email.toLowerCase()).first();
    if (!user) return errors.invalidLogin;
  } catch (e) {
    return errors.fetchDB('user', e);
  }
  try {
    isPasswordValid = bcrypt.compareSync(password, user.hashed_pwd);
    if (!isPasswordValid) return errors.invalidLogin;
  } catch (e) {
    return errors.bcrypt(e);
  }
  return user;
};

const stripHashedPwd = (user) => {
  const userWithoutHashedPwd = { ...user };
  delete userWithoutHashedPwd.hashed_pwd;
  return userWithoutHashedPwd;
};

const login = async (req) => {
  let user;
  if (req.tokenId) user = await loginWithTokenId(req.tokenId);
  else user = await loginWithCredentials(req.body);
  if (!user.error) user = stripHashedPwd(user);
  return user;
};

module.exports = { login };
