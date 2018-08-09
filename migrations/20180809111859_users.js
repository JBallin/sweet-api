exports.up = knex => (
  knex.schema.createTable('users', table => {
    table.increments();
  })
);

exports.down = knex => (
  knex.schema.dropTable('users');
);
