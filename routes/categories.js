const router = require('express').Router();
const knex = require('../knex');

router.get('/', (req, res) => {
  knex('categories')
    .then(categories => res.json(categories));
});

module.exports = router;
