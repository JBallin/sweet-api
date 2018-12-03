const request = require('supertest');
const app = require('../src/app');
const { formatErr } = require('./utils/errors');

describe('/', () => {
  describe('GET', () => {
    it('should return HTML', (done) => {
      request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          return done();
        });
    });
  });
});
