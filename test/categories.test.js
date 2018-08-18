const request = require('supertest');
const app = require('../app');
const knex = require('../knex');

describe('categories', () => {
  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run()));

  it('should return JSON', (done) => {
    request(app)
      .get('/categories')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
