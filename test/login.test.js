const request = require('supertest');
const { assert } = require('chai');
const app = require('../src/app');
const { seeds } = require('../seeds/001users');
const { formatErr } = require('./utils/errors');

const invalid = {
  email: seeds[0].email,
  password: 'HELLO',
};

const valid = {
  email: seeds[0].email,
  password: 'hello',
};

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
          if (err) return done(formatErr(err, res));
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
          if (err) return done(formatErr(err, res));
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
          if (err) return done(formatErr(err, res));
          assert.deepEqual(res.body, { username: seeds[0].username });
          return done();
        });
    });
  });
});
