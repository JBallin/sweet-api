const bcrypt = require('bcrypt');
const uuid = require('uuid/v4');
const knex = require('../../knex');
const { createError } = require('../utils/errors');

const getAllUsers = () => {
  try {
    return knex('users').select('username', 'name');
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

const testUniques = (body, users) => {
  const uniques = ['id', 'gist_id', 'email', 'username'];
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
    const id = uuid();
    const email = body.email.toLowerCase();
    const newUser = { id, ...body, email };
    const uniqueErr = testUniques(newUser, users);
    if (uniqueErr) return createError(400, uniqueErr);
    newUser.hashed_pwd = bcrypt.hashSync(body.password, 10);
    delete newUser.password;
    const [user] = await knex('users').insert(newUser, '*');
    return { new_user: user.username };
  } catch (err) {
    return createError(500, err.message);
  }
};

