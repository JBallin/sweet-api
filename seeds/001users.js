require('dotenv').config();

exports.seed = knex => (
  knex('users').del()
    .then(() => knex('users').insert([
      {
        username: 'JBallin',
        name: 'J Ballin',
        email: 'jballin@fake.com',
        hashed_pwd: '$2b$10$UA1gR2UoCttavzzHcEj6X.HVr4HnAAHF8TQltdbeQCd/8tUOHXoIS',
        gist_id: process.env.JBALLIN_GIST_ID,
      },
    ]))
);
