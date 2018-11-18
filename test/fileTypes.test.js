const request = require('supertest');
const knex = require('../knex');
const app = require('../src/app');

describe('fileTypes', () => {
  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run()));

  it('should return JSON', (done) => {
    request(app)
      .get('/fileTypes')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
