exports.seed = knex => (
  knex('categories').del()
  .then(() => knex('categories').insert([
    {title: 'Shell'},
    {title: 'Brew'},
    {title: 'Git'},
    {title: 'Node'},
    {title: 'Atom'},
    {title: 'VS Code'},
    {title: 'Text Editors'}
  ]))
);
