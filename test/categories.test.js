const request = require('supertest');
const app = require('../src/app');

describe('/categories', () => {
  describe('GET', () => {
    it('should return JSON', (done) => {
      request(app)
        .get('/categories')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });
});
