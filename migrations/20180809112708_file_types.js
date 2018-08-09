exports.up = knex => (
  knex.schema.createTable('file_types', table => {
    table.increments();
  })
);

exports.down = knex => (
  knex.schema.dropTable('file_types');
);
