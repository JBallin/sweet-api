const knex = require('../knex');

beforeEach(async () => {
  await knex.migrate.rollback();
  await knex.migrate.latest();
  await knex.seed.run();
});
after(() => knex.destroy());
