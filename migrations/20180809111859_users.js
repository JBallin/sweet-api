exports.up = knex => (
  knex.schema.createTable('users', (table) => {
    table.increments();
    table.string('gist_id', 32).defaultTo(null);
    table.string('name', 64).notNullable();
    table.string('email').unique().notNullable();
    table.string('username', 32).unique().notNullable();
    table.string('hashed_pwd').notNullable();
    table.timestamps(true, true);
  })
);

exports.down = knex => knex.schema.dropTable('users');
