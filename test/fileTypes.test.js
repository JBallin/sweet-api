const request = require('supertest');
const app = require('../src/app');

describe('fileTypes', () => {
  it('should return JSON', (done) => {
    request(app)
      .get('/fileTypes')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
