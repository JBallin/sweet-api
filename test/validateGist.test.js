const request = require('supertest');
const { assert } = require('chai');
const app = require('../src/app');

const validGistId = 'f7217444324b91f926d01e1c02ce2755';

describe('/validateGist/:gistId', () => {
  describe('GET', () => {
    it('should return true when valid', (done) => {
      request(app)
        .post('/validateGist')
        .send({ gistId: validGistId })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.isTrue(res.body.isValid);
          return done();
        });
    });
    it('should return error when invalid', (done) => {
      request(app)
        .post('/validateGist')
        .send({ gistId: 2 })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.error, 'No gist with id \'2\'');
          return done();
        });
    });
    it('should return error when a valid gist but not valid ballin-scripts gist', (done) => {
      request(app)
        .post('/validateGist')
        .send({ gistId: 1 })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.error, 'Invalid ballin-scripts gist');
          return done();
        });
    });
    it('should return error when no gist id given', (done) => {
      request(app)
        .post('/validateGist')
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.error, 'No gist id provided');
          return done();
        });
    });
  });
});
