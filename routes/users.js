const router = require('express').Router();
const knex = require('../knex');

router.get('/', (req, res) => {
  knex('users')
    .then(users => res.json(users))
    .catch((err) => {
      console.error(err); // eslint-disable-line no-console
      res.status(500).send('Error fetching users table');
    });
});

module.exports = router;
