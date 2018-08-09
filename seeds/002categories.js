exports.seed = function(knex, Promise) {
  return knex('categories').del()
    .then(() => {
      return knex('categories').insert([
        {colName: 'rowValue1'},
        {colName: 'rowValue2'},
        {colName: 'rowValue3'}
      ]);
    });
};
