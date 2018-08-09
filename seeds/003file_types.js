exports.seed = function(knex, Promise) {
  return knex('file_types').del()
    .then(() => {
      return knex('file_types').insert([
        {colName: 'rowValue1'},
        {colName: 'rowValue2'},
        {colName: 'rowValue3'}
      ]);
    });
};
