require('dotenv').config();

const seeds = [{
  gist_id: process.env.GIST_ID || 1,
  name: 'J Ballin',
  email: 'jballin@fake.com',
  username: 'JBallin',
  hashed_pwd: '$2b$10$fn09RI9qU6OHe6/89oNMn.q/VshQc8V3kzg6x81XvtNJYLUnSd79W',
}];

const seed = knex => (
  knex('users').del()
    .then(() => knex('users').insert(seeds))
);

module.exports = { seeds, seed };
