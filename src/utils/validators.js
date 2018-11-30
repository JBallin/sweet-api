const knex = require('../../knex');
const { validateGist } = require('./gistAPI');
const errors = require('./errors');

const expectedFields = ['gist_id', 'name', 'email', 'username', 'password'];

const validateUser = (req, res, next) => {
  const { body } = req;
  const bodyKeys = Object.keys(body);
  if (!bodyKeys.length) {
    return next(errors.noBody.error);
  }

  const missingFields = expectedFields.reduce((missing, field) => {
    if (!body[field]) {
      missing.push(field);
    }
    return missing;
  }, []);
  if (missingFields.length) {
    return next(errors.missing(missingFields).error);
  }

  const remainingBodyKeys = bodyKeys.filter(k => !expectedFields.includes(k));
  if (remainingBodyKeys.length) {
    return next(errors.extra(remainingBodyKeys).error);
  }

  return next();
};

const validateUserUpdate = (req, res, next) => {
  const { body } = req;
  const bodyKeys = Object.keys(body);
  if (!bodyKeys.length) {
    return next(errors.noBody.error);
  }

  const invalidFields = Object.keys(body).reduce((invalid, field) => {
    if (!expectedFields.includes(field)) {
      invalid.push(field);
    }
    return invalid;
  }, []);
  if (invalidFields.length) {
    return next(errors.invalid(invalidFields).error);
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
    return next(errors.uuid(id).error);
  }
  try {
    const user = await knex('users').where('id', id).first();
    if (!user) {
      return next(errors.idDNE(id).error);
    }
    return next();
  } catch (e) {
    return next(errors.fetchDB('users', e).error);
  }
};

const validateLoginBody = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(errors.missingLogin.error);
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

const validateJwtKey = (req, res, next) => {
  if (!process.env.JWT_KEY) {
    next(errors.jwtKeyMissing.error);
  } else {
    next();
  }
};

module.exports = {
  validateUser, validateId, validateUserUpdate, validateLoginBody, validateGistId, validateJwtKey,
};
