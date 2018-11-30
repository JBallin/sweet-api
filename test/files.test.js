const request = require('supertest');
const app = require('../src/app');

describe('/files', () => {
  before(() => {
    if (!process.env.GIST_ID) this.skip();
  });

  describe('GET', () => {
    it('should return JSON', (done) => {
      request(app)
        .get('/files')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            if (res.body.error) return done(Error(res.body.error));
            return done(err);
          }
          return done();
        });
    });
  });
});
