const request = require('supertest');
const app = require('../src/app');

describe('users', () => {
  it('should return JSON', (done) => {
    request(app)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
