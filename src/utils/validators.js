const knex = require('../../knex');
const { createError } = require('./errors');

const expectedFields = ['gist_id', 'name', 'email', 'username', 'password'];

const validateUser = (req, res, next) => {
  const { body } = req;
  if (!body) return next(createError(400, 'No user body sent').error);

  const missingFields = expectedFields.reduce((missing, field) => {
    if (!body[field]) {
      missing.push(field);
    }
    return missing;
  }, []);
  if (missingFields.length) {
    return next(createError(400, `Missing fields: ${missingFields.join(', ').trim(',')}.`).error);
  }

  const remainingBodyKeys = Object.keys(body).filter(k => !expectedFields.includes(k));
  if (remainingBodyKeys.length) {
    return next(createError(400, `Extra fields: ${remainingBodyKeys.join(', ').trim(',')}.`).error);
  }

  return next();
};

const validateUserUpdate = (req, res, next) => {
  const invalidFields = Object.keys(req.body).reduce((invalid, field) => {
    if (!expectedFields.includes(field)) {
      invalid.push(field);
    }
    return invalid;
  }, []);
  if (invalidFields.length) {
    return next(createError(400, `Invalid fields: ${invalidFields.join(', ').trim(',')}.`).error);
  }
  return next();
};

const validateId = async (req, res, next) => {
  const { id } = req.params;
  if (Number.isNaN(Number(id))) {
    return next(createError(400, `ID '${id}' is not a number`).error);
  }
  const user = await knex('users').where('id', id).first();
  if (!user) return next(createError(400, `No user with ID '${id}'`).error);
  return next();
};

module.exports = { validateUser, validateId, validateUserUpdate };
