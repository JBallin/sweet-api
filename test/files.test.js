/* eslint-disable prefer-arrow-callback, func-names */

const request = require('supertest');
const app = require('../app');
const knex = require('../knex');

describe('files', () => {
  beforeEach(function () {
    if (!process.env.GIST_ID) this.skip();

    return knex.migrate.rollback()
      .then(() => knex.migrate.latest())
      .then(() => knex.seed.run());
  });

  it('should return JSON', (done) => {
    request(app)
      .get('/files')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
