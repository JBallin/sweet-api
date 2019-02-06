const bcrypt = require('bcrypt');
const knex = require('../../knex');
const { validateGist } = require('./gistAPI');
const auth = require('./auth');
const errors = require('./errors');
const { seeds } = require('../../seeds/001users');

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

const isEmailValid = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const doesUsernameHaveSpaces = username => username.includes(' ');

const isUsernameTooLong = username => username.length > 36;

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

  if (!isEmailValid(body.email)) {
    return next(errors.invalidEmail(body.email).error);
  }
  if (doesUsernameHaveSpaces(body.username)) {
    return next(errors.invalidUsernameSpaces.error);
  }
  if (isUsernameTooLong(body.username)) {
    return next(errors.invalidUsernameLength.error);
  }

  const isUnique = await isUserUnique(body);
  if (isUnique !== true) {
    const { unique, target } = isUnique.errors[0];
    return next(errors.unique(unique, target).error);
  }

  return next();
};

const validateUserUpdate = async (req, res, next) => {
  const { currentPassword, ...body } = req.body;
  const { id } = req.params;
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

  const isUnique = await isUserUnique(body, id);
  if (isUnique !== true) {
    const { unique, target } = isUnique.errors[0];
    return next(errors.unique(unique, target).error);
  }

  return next();
};

const validateUUID = (id) => {
  const re = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return re.test(id);
};

const validateNotDemo = async (req, res, next) => {
  const { id } = req.params;
  return id === seeds[0].id ? next(errors.demoDisabled.error) : next();
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
    if (!isEmailValid(email)) {
      return next(errors.invalidEmail(email).error);
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

const validateGistIdIfExists = (req, res, next) => {
  const { gist_id: gistId } = req.body;
  if (gistId) validateGistId(req, res, next);
  else next();
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

const getHashedPassword = async (id) => {
  const { hashed_pwd: hashedPassword } = await knex('users').where('id', id).select('hashed_pwd').first();
  return hashedPassword;
};

const checkCurrentPassword = async (id, currentPassword) => {
  let currentHashedPassword;
  try {
    currentHashedPassword = await getHashedPassword(id);
  } catch (e) {
    return errors.fetchDB('hashed_pwd', e);
  }

  try {
    if (!currentPassword || !bcrypt.compareSync(currentPassword, currentHashedPassword)) {
      return errors.invalidCurrPwd;
    }
  } catch (e) {
    return errors.bcrypt(e);
  }

  return true;
};

const validateCurrPwd = async (req, res, next) => {
  const { currentPassword } = req.body;
  const { id } = req.params;
  if (!currentPassword) return next(errors.missingCurrPwd.error);
  const checkCurrPwdRes = await checkCurrentPassword(id, currentPassword);
  if (checkCurrPwdRes.error) return next(checkCurrPwdRes.error);
  delete req.body.currentPassword;
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
  validateCurrPwd,
  validateGistIdIfExists,
  validateNotDemo,
};
