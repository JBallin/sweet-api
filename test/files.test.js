const request = require('supertest');
const app = require('../app');
const knex = require('../knex');

if (process.env.GIST_ID) {
  describe('files', () => {
    beforeEach(() => knex.migrate.rollback()
      .then(() => knex.migrate.latest())
      .then(() => knex.seed.run()));

    it('should return JSON', (done) => {
      request(app)
        .get('/files')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });
}
