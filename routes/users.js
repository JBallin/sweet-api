const router = require('express').Router();
const knex = require('../knex');
const { createError } = require('../utils/errors');

router.get('/', (req, res) => {
  knex('users')
    .then(users => res.json(users))
    .catch(err => next(createError(500, 'Error fetching users table', err)));
});

module.exports = router;
