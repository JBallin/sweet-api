const bcrypt = require('bcrypt');
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

const createUser = async (body) => {
  try {
    const users = await knex('users');
    const email = body.email.toLowerCase();
    const newUser = { id, ...body, email };
    const uniqueErr = testUniques(body, users);
    if (uniqueErr) return createError(400, uniqueErr);
    newUser.hashed_pwd = bcrypt.hashSync(body.password, 10);
    delete newUser.password;
    const user = (await knex('users').insert(newUser, '*'))[0];
    return stripSensitiveData(user);
  } catch (err) {
    return createError(500, err.message);
  }
};

