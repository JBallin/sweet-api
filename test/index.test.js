const request = require('supertest');
const app = require('../src/app');

describe('index', () => {
  it('should return HTML', (done) => {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });
});
