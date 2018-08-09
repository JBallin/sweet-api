exports.up = knex => (
  knex.schema.createTable('categories', table => {
    table.increments();
  })
);

exports.down = knex => (
  knex.schema.dropTable('categories');
);
