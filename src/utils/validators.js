const knex = require('../../knex');
const { createError } = require('./errors');

const validateUser = (req, res, next) => {
  const { body } = req;
  if (!body) return next(createError(400, 'No user body sent').error);

  const expectedFields = ['gist_id', 'name', 'email', 'username', 'password'].sort();
  const missingFields = expectedFields.reduce((missing, field) => {
    if (!body[field]) missing.push(field);
    return missing;
  }, []);
  if (missingFields.length) {
    return next(createError(400, { missingFields }).error);
  }

  const bodyKeys = Object.keys(body).sort();
  if (bodyKeys.length !== expectedFields.length) {
    return next(createError(400, `Invalid body. Expected: ${expectedFields}. Received: ${bodyKeys}`).error);
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

module.exports = { validateUser, validateId };
