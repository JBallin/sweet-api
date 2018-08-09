const router = require('express').Router();
const knex = require('../knex');

router.get('/', (req, res) => {
  knex('users')
  .then(users => res.json(users))
});

module.exports = router;
