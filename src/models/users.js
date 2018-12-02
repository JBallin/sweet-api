const bcrypt = require('bcrypt');
const uuid = require('uuid/v4');
const knex = require('../../knex');
const errors = require('../utils/errors');

const getAllUsers = () => knex('users').select('username', 'name')
  .catch(e => errors.fetchDB('users', e));

const getUser = id => knex('users').where('id', id).first()
  .catch(e => errors.fetchDB('user', e));

const createUser = async (body) => {
  try {
    const id = uuid();
    const email = body.email.toLowerCase();
    const newUser = { id, ...body, email };
    newUser.hashed_pwd = bcrypt.hashSync(body.password, 10);
    delete newUser.password;
    const [user] = await knex('users').insert(newUser, '*');
    return { new_user: user.username };
  } catch (e) {
    return errors.addUserDB(e);
  }
};

const updateUser = async (id, body) => {
  try {
    const user = { ...body };
    const updatedFields = Object.keys(user);
    if (user.password) {
      user.hashed_pwd = bcrypt.hashSync(user.password, 10);
      delete user.password;
    }
    if (user.email) {
      user.email = user.email.toLowerCase();
    }
    const [editedUser] = await knex('users').where('id', id).update({
      ...user, updated_at: knex.fn.now(),
    }, '*');
    const userUpdates = updatedFields.reduce((res, field) => ({
      ...res, [field]: editedUser[field],
    }), {});
    if (editedUser.hashed_pwd) {
      userUpdates.password = 'UPDATED';
    } else if (userUpdates.password) {
      return errors.updatePwd;
    }
    return userUpdates;
  } catch (e) {
    return errors.userUpdateDB(e);
  }
};

const deleteUser = async (id) => {
  const user = await getUser(id);
  if (user.error) return user;
  try {
    return await knex('users').where('id', id).del();
  } catch (e) {
    return errors.deleteUserDB(e);
  }
};


module.exports = {
  getAllUsers, getUser, createUser, deleteUser, updateUser,
};
