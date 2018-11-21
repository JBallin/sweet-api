const model = require('../models/users');

const getAllUsers = async (req, res, next) => {
  const users = await model.getAllUsers();
  if (users.error) next(users.error);
  else res.json(users);
};

const getUser = async (req, res, next) => {
  const user = await model.getUser(req.params.id);
  if (user.error) next(user.error);
  else res.json(user);
};

const createUser = async (req, res, next) => {
  const user = await model.createUser(req.body);
  if (user.error) next(user.error);
  else res.status(201).json(user);
};

const updateUser = async (req, res, next) => {
  const editedUser = await model.updateUser(req.params.id, req.body);
  if (editedUser.error) next(editedUser.error);
  else res.status(200).json(editedUser);
};

const deleteUser = async (req, res, next) => {
  const deleted = await model.deleteUser(req.params.id);
  if (deleted.error) next(deleted.error);
  else res.sendStatus(204);
};

module.exports = {
  getAllUsers, getUser, createUser, deleteUser, updateUser,
};
