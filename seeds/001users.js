require('dotenv').config();

const seeds = [{
  gist_id: process.env.GIST_ID || 1,
  name: 'J Ballin',
  email: 'jballin@fake.com',
  username: 'JBallin',
  hashed_pwd: '$2b$10$UA1gR2UoCttavzzHcEj6X.HVr4HnAAHF8TQltdbeQCd/8tUOHXoIS',
}];

const seed = knex => (
  knex('users').del()
    .then(() => knex('users').insert(seeds))
);

module.exports = { seeds, seed };
