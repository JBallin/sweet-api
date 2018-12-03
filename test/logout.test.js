const request = require('supertest');
const app = require('../src/app');
const { formatErr } = require('./utils/errors');

describe('/logout', () => {
  describe('POST', () => {
    it('should logout user', (done) => {
      request(app)
        .post('/logout')
        .expect(205)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          return done();
        });
    });
  });
});
