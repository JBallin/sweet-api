const request = require('supertest');
const { assert } = require('chai');
const app = require('../src/app');
const { seeds } = require('../seeds/001users');
const { formatErr } = require('./utils/errors');
const { createToken } = require('../src/utils/auth');

const errors = {
  missingLogin: 'Missing email or password',
  invalidLogin: 'Invalid credentials. Please try again.',
  invalidJWT: 'Invalid token',
};

const invalid = { email: seeds[0].email, password: 'HELLO' };
const valid = { email: seeds[0].email, password: 'hello' };
const seedId = seeds[0].id;
const uuidThatDNE = 'de455777-255e-4e61-b53c-6dd942f1ad7c';
const seedToken = createToken({ id: seedId });
const invalidToken = createToken({ id: seedId }, 0);
const wrongUserToken = createToken({ id: uuidThatDNE });

describe('/login', () => {
  describe('POST', () => {
    it('should login with token (- email/password)', (done) => {
      request(app)
        .post('/login')
        .set('Cookie', [`token=${seedToken}`])
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          const strippedBody = { ...res.body };
          delete strippedBody.created_at;
          delete strippedBody.updated_at;
          const seedWithoutHashedPwd = { ...seeds[0] };
          delete seedWithoutHashedPwd.hashed_pwd;
          assert.deepEqual(strippedBody, seedWithoutHashedPwd);
          return done();
        });
    });
    it('should login with token (+ invalid email/password)', (done) => {
      request(app)
        .post('/login')
        .set('Cookie', [`token=${seedToken}`])
        .send(invalid)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          const strippedBody = { ...res.body };
          delete strippedBody.created_at;
          delete strippedBody.updated_at;
          const seedWithoutHashedPwd = { ...seeds[0] };
          delete seedWithoutHashedPwd.hashed_pwd;
          assert.deepEqual(strippedBody, seedWithoutHashedPwd);
          return done();
        });
    });
    it('should login with token (+ valid email/password)', (done) => {
      request(app)
        .post('/login')
        .set('Cookie', [`token=${seedToken}`])
        .send(valid)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          const strippedBody = { ...res.body };
          delete strippedBody.created_at;
          delete strippedBody.updated_at;
          const seedWithoutHashedPwd = { ...seeds[0] };
          delete seedWithoutHashedPwd.hashed_pwd;
          assert.deepEqual(strippedBody, seedWithoutHashedPwd);
          return done();
        });
    });
    it('should error with invalid token (- email/password)', (done) => {
      request(app)
        .post('/login')
        .set('Cookie', [`token=${invalidToken}`])
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidJWT);
          return done();
        });
    });
    it('should error with invalid token (+ invalid email/password)', (done) => {
      request(app)
        .post('/login')
        .set('Cookie', [`token=${invalidToken}`])
        .send(invalid)
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidJWT);
          return done();
        });
    });
    it('should error with invalid token (+ valid email/password)', (done) => {
      request(app)
        .post('/login')
        .set('Cookie', [`token=${invalidToken}`])
        .send(valid)
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidJWT);
          return done();
        });
    });
    it('should error with unauthorized token', (done) => {
      request(app)
        .post('/login')
        .set('Cookie', [`token=${wrongUserToken}`])
        .send(valid)
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidJWT);
          return done();
        });
    });
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
          const strippedBody = { ...res.body };
          delete strippedBody.created_at;
          delete strippedBody.updated_at;
          const seedWithoutHashedPwd = { ...seeds[0] };
          delete seedWithoutHashedPwd.hashed_pwd;
          assert.deepEqual(strippedBody, seedWithoutHashedPwd);
          return done();
        });
    });
  });
});
