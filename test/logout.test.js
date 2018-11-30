const request = require('supertest');
const app = require('../src/app');

describe('/logout', () => {
  describe('POST', () => {
    it('should logout user', (done) => {
      request(app)
        .post('/logout')
        .expect(205)
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
