const knex = require('../../knex');
const { createError } = require('../utils/errors');

const getAllUsers = () => {
  try {
    return knex('users').select('id', 'username', 'name');
  } catch (err) {
    return createError(500, 'Error fetching users table', err);
  }
};

const getUser = (id) => {
  try {
    return knex('users').where('id', id).first();
  } catch (err) {
    return createError(500, 'Error fetching user', err);
  }
};

const stripSensitiveData = (unstrippedUser) => {
  const user = { ...unstrippedUser };
  delete user.hashed_pwd;
  delete user.created_at;
  delete user.updated_at;
  delete user.id;
  return user;
};

const testUniques = (body, users) => {
  const uniques = ['gist_id', 'email', 'username'];
  return users.reduce((uniqueErr, user) => {
    let err;
    uniques.forEach((unique) => {
      if (!err && (body[unique] === user[unique])) {
        err = `User with ${unique} '${body[unique]}' already exists`;
      }
    });
    return err || uniqueErr;
  }, '');
};

