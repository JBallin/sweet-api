const knex = require('../../knex');
const { validateGist } = require('./gistAPI');
const auth = require('./auth');
const errors = require('./errors');

const expectedFields = ['gist_id', 'email', 'username', 'password'];
const randomUUID = '44261a83-2fdf-4aac-a4f9-da0c53532e09';

const isUserUnique = async (body, id = randomUUID) => {
  const uniques = ['gist_id', 'username', 'email'];
  const uniqueTests = uniques.map(async (unique) => {
    const target = body[unique];
    if (target) {
      const user = await knex('users').whereNot('id', id).andWhere(unique, target.toLowerCase()).first();
      if (user) return ({ unique, target });
    }
    return true;
  });
  const uniqueResults = await Promise.all(uniqueTests);
  const errs = uniqueResults.filter(res => res !== true);
  return errs.length ? { errors: errs } : true;
};

const validateUser = async (req, res, next) => {
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

  const isUnique = await isUserUnique(body);
  if (isUnique !== true) {
    const { unique, target } = isUnique.errors[0];
    return next(errors.unique(unique, target).error);
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
  if (!req.tokenId) {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(errors.missingLogin.error);
    }
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

const validateJWT = (req, res, next) => {
  const { token } = req.cookies;
  const { id } = req.params;
  if (!token) return next(errors.noToken.error);
  const isValid = auth.validateJWT(token, id);
  if (isValid.error) return next(errors.invalidJWT(isValid.error).error);
  if (!isValid) return next(errors.unauthorized.error);
  return next();
};

const tryTokenLoginAndStoreId = (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const id = auth.getTokenId(token);
    if (id.error) return next(errors.invalidJWT(id.error).error);
    req.tokenId = id;
  }
  return next();
};

module.exports = {
  validateUser,
  validateId,
  validateUserUpdate,
  validateLoginBody,
  validateGistId,
  validateJWT,
  tryTokenLoginAndStoreId,
};
