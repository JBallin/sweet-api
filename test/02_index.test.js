const request = require('supertest');
const app = require('../src/app');

describe('/', () => {
  describe('GET', () => {
    it('should return HTML', (done) => {
      request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            if (res.body.error) return done(Error(res.body.error));
            return done(err);
          }
          return done(err);
        });
    });
  });
});
