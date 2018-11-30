const request = require('supertest');
const app = require('../src/app');

describe('/fileTypes', () => {
  describe('GET', () => {
    it('should return JSON', (done) => {
      request(app)
        .get('/fileTypes')
        .expect('Content-Type', /json/)
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
