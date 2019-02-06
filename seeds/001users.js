const seeds = [
  {
    id: '1ee370d1-2ef3-4c0e-b0f3-6ffccc697dd0',
    gist_id: '5fb484f659ccc54a493d4295d6346a39',
    name: null,
    username: 'demo_user',
    email: 'demo@gmail.com',
    hashed_pwd: '$2b$10$fn09RI9qU6OHe6/89oNMn.q/VshQc8V3kzg6x81XvtNJYLUnSd79W',
  },
  {
    id: '4cae274d-ae5f-43ce-8011-643da4b1cac2',
    gist_id: '42f0dc9d2802d23dad637425bef92f63',
    name: null,
    username: 'test_user',
    email: 'test@gmail.com',
    hashed_pwd: '$2b$10$fn09RI9qU6OHe6/89oNMn.q/VshQc8V3kzg6x81XvtNJYLUnSd79W',
  },
];

const seed = knex => (
  knex('users').del()
    .then(() => knex('users').insert(seeds))
);

module.exports = { seeds, seed };
