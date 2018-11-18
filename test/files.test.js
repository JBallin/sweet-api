/* eslint-disable prefer-arrow-callback, func-names */

const request = require('supertest');
const app = require('../src/app');

describe('files', () => {
  before(function () {
    if (!process.env.GIST_ID) this.skip();
  });

  it('should return JSON', (done) => {
    request(app)
      .get('/files')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
