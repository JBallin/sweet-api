const knex = require('../../knex');
const { createError } = require('./errors');
const { validateGist } = require('./gistAPI');

const expectedFields = ['gist_id', 'name', 'email', 'username', 'password'];

const validateUser = (req, res, next) => {
  const { body } = req;
  const bodyKeys = Object.keys(body);
  if (!bodyKeys.length) {
    const err = createError(400, 'No body');
    return next(err.error);
  }

  const missingFields = expectedFields.reduce((missing, field) => {
    if (!body[field]) {
      missing.push(field);
    }
    return missing;
  }, []);
  if (missingFields.length) {
    const err = createError(400, `Missing fields: ${missingFields.join(', ').trim(',')}`);
    return next(err.error);
  }

  const remainingBodyKeys = bodyKeys.filter(k => !expectedFields.includes(k));
  if (remainingBodyKeys.length) {
    const err = createError(400, `Extra fields: ${remainingBodyKeys.join(', ').trim(',')}`);
    return next(err.error);
  }
  req.body.email = req.body.email.toLowerCase();

  return next();
};

const validateUserUpdate = (req, res, next) => {
  const { body } = req;
  const bodyKeys = Object.keys(body);
  if (!bodyKeys.length) {
    const err = createError(400, 'No body');
    return next(err.error);
  }

  const invalidFields = Object.keys(body).reduce((invalid, field) => {
    if (!expectedFields.includes(field)) {
      invalid.push(field);
    }
    return invalid;
  }, []);
  if (invalidFields.length) {
    const err = createError(400, `Invalid fields: ${invalidFields.join(', ').trim(',')}`);
    return next(err.error);
  }
  return next();
};

const validateUUID = (id) => {
  const re = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return re.test(id);
};

const validateId = async (req, res, next) => {
  const { id } = req.params;
  if (!validateUUID(id)) {
    const err = createError(400, `Invalid UUID '${id}'`);
    return next(err.error);
  }
  try {
    const user = await knex('users').where('id', id).first();
    if (!user) {
      const err = createError(400, `No user with ID '${id}'`);
      return next(err.error);
    }
    return next();
  } catch (e) {
    const err = createError(500, 'Error fetching users table', e);
    return next(err.error);
  }
};

const validateLoginBody = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const err = createError(400, 'Missing email or password');
    return next(err.error);
  }
  return next();
};

const validateGistId = async (req, res, next) => {
  const result = await validateGist(req.body.gist_id);
  if (result.error) {
    next(result.error);
  } else {
    next();
  }
};

module.exports = {
  validateUser, validateId, validateUserUpdate, validateLoginBody, validateGistId,
};
