const request = require('supertest');
const { assert } = require('chai');
const app = require('../src/app');

const invalid = {
  email: 'joe@invalid.com',
  password: 'invalid password',
};

const valid = {
  email: 'JBALLIN@fake.com',
  password: 'hello',
};

describe('/login', () => {
  describe('POST', () => {
    it('should catch missing email/password', (done) => {
      request(app)
        .post('/login')
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.error, 'Missing email or password');
          return done();
        });
    });
    it('should catch invalid credentials', (done) => {
      request(app)
        .post('/login')
        .send(invalid)
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.error, 'Invalid credentials. Please try again.');
          return done();
        });
    });
    it('should register correct login', (done) => {
      request(app)
        .post('/login')
        .send(valid)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.deepEqual(res.body, { validCredentials: true });
          return done();
        });
    });
  });
});
