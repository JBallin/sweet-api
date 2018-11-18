const request = require('supertest');
const knex = require('../knex');
const app = require('../src/app');

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
