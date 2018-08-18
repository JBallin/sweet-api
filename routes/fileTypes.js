const router = require('express').Router();
const knex = require('../knex');

router.get('/', (req, res) => {
  knex('file_types')
    .then(types => res.json(types));
});

module.exports = router;
