const request = require('supertest');
const app = require('../src/app');
const { formatErr } = require('./utils/errors');

describe('/files', () => {
  describe('GET', () => {
    it('should return JSON', (done) => {
      request(app)
        .get('/files')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          return done();
        });
    });
  });
});
