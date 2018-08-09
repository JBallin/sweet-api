exports.up = knex => (
  knex.schema.createTable('categories', table => {
    table.increments();
    table.string('title').notNullable();
  })
);

exports.down = knex => knex.schema.dropTable('categories');
