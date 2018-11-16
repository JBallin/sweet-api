const router = require('express').Router();
const knex = require('../../knex');

router.get('/', (req, res) => {
  knex('categories')
    .then(categories => res.json(categories))
    .catch((err) => {
      console.error(err); // eslint-disable-line no-console
      res.status(500).send('Error fetching categories table');
    });
});

module.exports = router;
