const knex = require('../../knex');
const errors = require('../utils/errors');

const getCategories = () => knex('categories').catch(e => errors.fetchDB('categories', e));

module.exports = { getCategories };
