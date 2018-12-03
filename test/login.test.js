const request = require('supertest');
const { assert } = require('chai');
const app = require('../src/app');

const invalid = {
  email: 'jballin@fake.com',
  password: 'HELLO',
};

const valid = {
  email: 'JBALLIN@fake.com',
  password: 'hello',
};

const validUsername = 'jballin';

const errors = {
  missingLogin: 'Missing email or password',
  invalidLogin: 'Invalid credentials. Please try again.',
};

describe('/login', () => {
  describe('POST', () => {
    it('should error missing email/password', (done) => {
      request(app)
        .post('/login')
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            if (res.body.error) return done(Error(res.body.error));
            return done(err);
          }
          assert.equal(res.body.error, errors.missingLogin);
          return done();
        });
    });
    it('should error invalid credentials', (done) => {
      request(app)
        .post('/login')
        .send(invalid)
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            if (res.body.error) return done(Error(res.body.error));
            return done(err);
          }
          assert.equal(res.body.error, errors.invalidLogin);
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
          if (err) {
            if (res.body.error) return done(Error(res.body.error));
            return done(err);
          }
          assert.deepEqual(res.body, { username: validUsername });
          return done();
        });
    });
  });
});
