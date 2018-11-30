const knex = require('../knex');
require('dotenv').load();

beforeEach(async () => {
  await knex.migrate.rollback();
  await knex.migrate.latest();
  await knex.seed.run();
});
after(() => knex.destroy());
