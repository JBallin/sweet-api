const router = require('express').Router();
const knex = require('../knex');

router.get('/', (req, res) => {
  knex('file_types')
    .then(types => res.json(types))
    .catch((err) => {
      console.error(err); // eslint-disable-line no-console
      res.status(500).send('Error fetching file_types table');
    });
});

module.exports = router;
