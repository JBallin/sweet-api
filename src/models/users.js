const bcrypt = require('bcrypt');
const uuid = require('uuid/v4');
const knex = require('../../knex');
const errors = require('../utils/errors');

const getAllUsers = () => knex('users').select('id', 'username')
  .catch(e => errors.fetchDB('users', e));

const getUser = async (id) => {
  const user = await knex('users').where('id', id).first()
    .catch(e => errors.fetchDB('user', e));
  delete user.hashed_pwd;
  return user;
};

const toLowerCase = obj => Object.keys(obj).reduce((res, key) => ({
  ...res, [key]: obj[key].toLowerCase(),
}), {});

const createUser = async (body) => {
  try {
    const id = uuid();
    const newUser = { id, ...toLowerCase(body) };
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
    const updateRequest = { ...body };
    const { password, email } = updateRequest;
    const updatedFields = [...Object.keys(body), 'updated_at'];

    if (password) {
      updateRequest.hashed_pwd = bcrypt.hashSync(password, 10);
      delete updateRequest.password;
    }
    if (email) {
      updateRequest.email = email.toLowerCase();
    }

    const [editedUser] = await knex('users').where('id', id).update({
      ...updateRequest, updated_at: knex.fn.now(),
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
  try {
    return await knex('users').where('id', id).del();
  } catch (e) {
    return errors.deleteUserDB(e);
  }
};


module.exports = {
  getAllUsers, getUser, createUser, deleteUser, updateUser,
};
