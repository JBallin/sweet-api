const gistIdLimit = 36;
const usernameLimit = 36;
const nameLimit = 64;

const up = knex => (
  knex.schema.createTable('users', (table) => {
    table.uuid('id').notNullable().primary();
    table.string('gist_id', gistIdLimit).unique().notNullable();
    table.string('name', nameLimit).notNullable();
    table.string('email').unique().notNullable();
    table.string('username', usernameLimit).unique().notNullable();
    table.string('hashed_pwd').notNullable();
    table.timestamps(true, true);
  })
);

const down = knex => knex.schema.dropTable('users');

module.exports = {
  nameLimit, usernameLimit, up, down,
};
