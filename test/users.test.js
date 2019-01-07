const request = require('supertest');
const { assert } = require('chai');
const app = require('../src/app');
const { seeds } = require('../seeds/001users');
const knex = require('../knex');
const { createToken } = require('../src/utils/auth');
const { formatErr } = require('./utils/errors');

const errors = {
  // ID
  uuid: id => `Invalid UUID '${id}'`,
  idDNE: id => `No user with ID '${id}'`,
  // POST
  noBody: 'No body',
  missing: fields => `Missing fields: ${fields.join(', ').trim(',')}`,
  unique: (field, key) => `User with ${field} '${key}' already exists`,
  extra: fields => `Extra fields: ${fields.join(', ').trim(',')}`,
  invalidEmail: email => `'${email}' is not a valid email`,
  invalidUsernameSpaces: 'Username cannot contain spaces',
  invalidUsernameLength: 'Username cannot exceed 36 characters',
  // GIST_ID
  gistDNE: id => `No gist with ID '${id}'`,
  invalidBSGist: 'Invalid ballin-scripts gist',
  // PUT
  invalid: fields => `Invalid fields: ${fields.join(', ').trim(',')}`,
  invalidCurrPwd: 'Invalid current password',
  missingCurrPwd: 'Missing current password',
  // TOKEN
  invalidJWT: 'Invalid token',
  unauthorized: 'Unauthorized',
  noToken: 'Missing token',
};

const payload = {
  gist_id: 'f7217444324b91f926d01e1c02ce2755',
  username: 'super_coder',
  email: 'git_creator@gmail.com',
};
const seedUser = seeds[0];
const payloadWithPassword = { ...payload, password: 'hello' };
const invalidCurrPwd = 'invalid';
const validCurrPwd = 'hello';
const putPayloadWithCurrPassword = { ...payload, password: 'new', currentPassword: validCurrPwd };
const putPayloadWithInvalidCurrPassword = { ...payload, password: 'new', currentPassword: invalidCurrPwd };
const uuidThatDNE = 'de455777-255e-4e61-b53c-6dd942f1ad7c';
const badId = '1';
const seedToken = createToken({ id: seedUser.id });
const invalidToken = createToken({ id: seedUser.id }, 0);
const wrongUserToken = createToken({ id: uuidThatDNE });
const invalidGistId = '2';
const invalidBSGistId = '1';
const seedUserInfoWithCurrPwd = {
  email: seedUser.email,
  gist_id: seedUser.gist_id,
  username: seedUser.username,
  currentPassword: validCurrPwd,
};
const invalidEmail = 'invalid';
const usernameWithSpaces = 'user name';
const longUsername = 'ThisUsernameIsJustTooLongUnfortunately';

describe('/users', () => {
  describe('GET', () => {
    it('should return users', (done) => {
      request(app)
        .get('/users')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          const { id, username } = seedUser;
          assert.deepEqual(res.body[0], {
            id, username,
          });
          return done();
        });
    });
  });
  describe('POST', () => {
    it('should create user', (done) => {
      request(app)
        .post('/users')
        .send(payloadWithPassword)
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.new_user, payload.username);
          return knex('users')
            .where('username', payload.username)
            .first()
            .then((user) => {
              assert.equal(user.email, payload.email);
            })
            .then(done);
        });
    });
    it('should error with missing fields', (done) => {
      request(app)
        .post('/users')
        .send(payload)
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.deepEqual(res.body.error, errors.missing(['password']));
          return done();
        });
    });
    it('should error with empty body', (done) => {
      request(app)
        .post('/users')
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.deepEqual(res.body.error, errors.noBody);
          return done();
        });
    });
    it('should error with extra fields', (done) => {
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, extra: 'hi' })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.extra(['extra']));
          return done();
        });
    });
    it('should error with existing email', (done) => {
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, email: seedUser.email })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.unique('email', seedUser.email));
          return done();
        });
    });
    it('should error with existing username', (done) => {
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, username: seedUser.username })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.unique('username', seedUser.username));
          return done();
        });
    });
    it('should error with existing gist_id', (done) => {
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, gist_id: seedUser.gist_id })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.unique('gist_id', seedUser.gist_id));
          return done();
        });
    });
    it('should error with invalid gist_id', (done) => {
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, gist_id: invalidGistId })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.gistDNE(invalidGistId));
          return done();
        });
    });
    it('should error with invalid ballin-scripts gist_id', (done) => {
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, gist_id: invalidBSGistId })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidBSGist);
          return done();
        });
    });
    it('should error with invalid email', (done) => {
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, email: invalidEmail })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidEmail(invalidEmail));
          return done();
        });
    });
    it('should error with username that has spaces', (done) => {
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, username: usernameWithSpaces })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidUsernameSpaces);
          return done();
        });
    });
    it('should error with username longer than 36 characters', (done) => {
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, username: longUsername })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidUsernameLength);
          return done();
        });
    });
  });
});

describe('/users/:id', () => {
  describe('GET', () => {
    it('should return user (without hashed_pwd)', (done) => {
      request(app)
        .get(`/users/${seedUser.id}`)
        .set('Cookie', [`token=${seedToken}`])
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.name, seedUser.name);
          assert.equal(res.body.username, seedUser.username);
          assert.equal(res.body.email, seedUser.email);
          assert.equal(res.body.gist_id, seedUser.gist_id);
          assert.isString(res.body.updated_at);
          assert.isString(res.body.created_at);
          assert.notProperty(res.body, 'hashed_pwd');
          return done();
        });
    });
    it('should error with no token', (done) => {
      request(app)
        .get(`/users/${seedUser.id}`)
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.noToken);
          return done();
        });
    });
    it('should error with invalid token', (done) => {
      request(app)
        .get(`/users/${seedUser.id}`)
        .set('Cookie', [`token=${invalidToken}`])
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
        .get(`/users/${seedUser.id}`)
        .set('Cookie', [`token=${wrongUserToken}`])
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.unauthorized);
          return done();
        });
    });
    it('should error with invalid ID', (done) => {
      request(app)
        .get(`/users/${badId}`)
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.uuid(badId));
          return done();
        });
    });
    it('should error with non-existent ID', (done) => {
      request(app)
        .get(`/users/${uuidThatDNE}`)
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.idDNE(uuidThatDNE));
          return done();
        });
    });
  });

  describe('PUT', () => {
    it('should update user password, gist_id, email, and username', (done) => {
      request(app)
        .put(`/users/${seedUser.id}`)
        .set('Cookie', `token=${seedToken}`)
        .send(putPayloadWithCurrPassword)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, payload.username);
              assert.notEqual(user.username, seedUser.username);
              assert.equal(user.gist_id, payload.gist_id);
              assert.notEqual(user.gist_id, seedUser.gist_id);
              assert.equal(user.email, payload.email);
              assert.notEqual(user.email, seedUser.email);
              assert.notEqual(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.notDeepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
    it('should update username', (done) => {
      const newUsername = 'new_username';
      request(app)
        .put(`/users/${seedUser.id}`)
        .set('Cookie', `token=${seedToken}`)
        .send({ username: newUsername, currentPassword: validCurrPwd })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, newUsername);
              assert.notEqual(user.username, seedUser.username);
              assert.equal(user.gist_id, seedUser.gist_id);
              assert.equal(user.email, seedUser.email);
              assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.notDeepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
    describe('should error with existing...', () => {
      beforeEach((done) => {
        request(app)
          .post('/users')
          .send(payloadWithPassword)
          .expect(201, done);
      });

      it('username', (done) => {
        request(app)
          .put(`/users/${seedUser.id}`)
          .set('Cookie', `token=${seedToken}`)
          .send({ username: payload.username, currentPassword: validCurrPwd })
          .expect(400)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if (err) return done(formatErr(err, res));
            assert.equal(res.body.error, errors.unique('username', payload.username));
            return knex('users')
              .where('id', seedUser.id)
              .first()
              .then((user) => {
                assert.equal(user.username, seedUser.username);
                assert.notEqual(user.username, payload.username);
                assert.equal(user.gist_id, seedUser.gist_id);
                assert.notEqual(user.gist_id, payload.gist_id);
                assert.equal(user.email, seedUser.email);
                assert.notEqual(user.email, payload.email);
                assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
                assert.equal(user.name, seedUser.name);
                assert.equal(user.id, seedUser.id);
                assert.deepEqual(user.created_at, user.updated_at);
              })
              .then(done);
          });
      });
      it('email', (done) => {
        request(app)
          .put(`/users/${seedUser.id}`)
          .set('Cookie', `token=${seedToken}`)
          .send({ email: payload.email, currentPassword: validCurrPwd })
          .expect(400)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if (err) return done(formatErr(err, res));
            assert.equal(res.body.error, errors.unique('email', payload.email));
            return knex('users')
              .where('id', seedUser.id)
              .first()
              .then((user) => {
                assert.equal(user.username, seedUser.username);
                assert.notEqual(user.username, payload.username);
                assert.equal(user.gist_id, seedUser.gist_id);
                assert.notEqual(user.gist_id, payload.gist_id);
                assert.equal(user.email, seedUser.email);
                assert.notEqual(user.email, payload.email);
                assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
                assert.equal(user.name, seedUser.name);
                assert.equal(user.id, seedUser.id);
                assert.deepEqual(user.created_at, user.updated_at);
              })
              .then(done);
          });
      });
      it('gist_id', (done) => {
        request(app)
          .put(`/users/${seedUser.id}`)
          .set('Cookie', `token=${seedToken}`)
          .send({ gist_id: payload.gist_id, currentPassword: validCurrPwd })
          .expect(400)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if (err) return done(formatErr(err, res));
            assert.equal(res.body.error, errors.unique('gist_id', payload.gist_id));
            return knex('users')
              .where('id', seedUser.id)
              .first()
              .then((user) => {
                assert.equal(user.username, seedUser.username);
                assert.notEqual(user.username, payload.username);
                assert.equal(user.gist_id, seedUser.gist_id);
                assert.notEqual(user.gist_id, payload.gist_id);
                assert.equal(user.email, seedUser.email);
                assert.notEqual(user.email, payload.email);
                assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
                assert.equal(user.name, seedUser.name);
                assert.equal(user.id, seedUser.id);
                assert.deepEqual(user.created_at, user.updated_at);
              })
              .then(done);
          });
      });
      it('should not error when given the updating users\' data', (done) => {
        request(app)
          .put(`/users/${seedUser.id}`)
          .set('Cookie', `token=${seedToken}`)
          .send(seedUserInfoWithCurrPwd)
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if (err) return done(formatErr(err, res));
            return knex('users')
              .where('id', seedUser.id)
              .first()
              .then((user) => {
                assert.equal(user.username, seedUser.username);
                assert.notEqual(user.username, payload.username);
                assert.equal(user.gist_id, seedUser.gist_id);
                assert.notEqual(user.gist_id, payload.gist_id);
                assert.equal(user.email, seedUser.email);
                assert.notEqual(user.email, payload.email);
                assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
                assert.equal(user.name, seedUser.name);
                assert.equal(user.id, seedUser.id);
                assert.notDeepEqual(user.created_at, user.updated_at);
              })
              .then(done);
          });
      });
    });
    it('should error with no token', (done) => {
      request(app)
        .put(`/users/${seedUser.id}`)
        .send(putPayloadWithCurrPassword)
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.noToken);
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, seedUser.username);
              assert.notEqual(user.username, payload.username);
              assert.equal(user.gist_id, seedUser.gist_id);
              assert.notEqual(user.gist_id, payload.gist_id);
              assert.equal(user.email, seedUser.email);
              assert.notEqual(user.email, payload.email);
              assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.deepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
    it('should error without current password', (done) => {
      request(app)
        .put(`/users/${seedUser.id}`)
        .set('Cookie', `token=${seedToken}`)
        .send(payload)
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.missingCurrPwd);
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, seedUser.username);
              assert.notEqual(user.username, payload.username);
              assert.equal(user.gist_id, seedUser.gist_id);
              assert.notEqual(user.gist_id, payload.gist_id);
              assert.equal(user.email, seedUser.email);
              assert.notEqual(user.email, payload.email);
              assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.deepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
    it('should error with invalid current password', (done) => {
      request(app)
        .put(`/users/${seedUser.id}`)
        .set('Cookie', `token=${seedToken}`)
        .send(putPayloadWithInvalidCurrPassword)
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidCurrPwd);
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, seedUser.username);
              assert.notEqual(user.username, payload.username);
              assert.equal(user.gist_id, seedUser.gist_id);
              assert.notEqual(user.gist_id, payload.gist_id);
              assert.equal(user.email, seedUser.email);
              assert.notEqual(user.email, payload.email);
              assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.deepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
    it('should error with invalid token', (done) => {
      request(app)
        .put(`/users/${seedUser.id}`)
        .set('Cookie', `token=${invalidToken}`)
        .send(putPayloadWithCurrPassword)
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidJWT);
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, seedUser.username);
              assert.notEqual(user.username, payload.username);
              assert.equal(user.gist_id, seedUser.gist_id);
              assert.notEqual(user.gist_id, payload.gist_id);
              assert.equal(user.email, seedUser.email);
              assert.notEqual(user.email, payload.email);
              assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.deepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
    it('should error with unauthorized token', (done) => {
      request(app)
        .put(`/users/${seedUser.id}`)
        .set('Cookie', `token=${wrongUserToken}`)
        .send(putPayloadWithCurrPassword)
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.unauthorized);
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, seedUser.username);
              assert.notEqual(user.username, payload.username);
              assert.equal(user.gist_id, seedUser.gist_id);
              assert.notEqual(user.gist_id, payload.gist_id);
              assert.equal(user.email, seedUser.email);
              assert.notEqual(user.email, payload.email);
              assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.deepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
    it('should error with empty body (but with current password)', (done) => {
      request(app)
        .put(`/users/${seedUser.id}`)
        .set('Cookie', `token=${seedToken}`)
        .send({ currentPassword: validCurrPwd })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.noBody);
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, seedUser.username);
              assert.notEqual(user.username, payload.username);
              assert.equal(user.gist_id, seedUser.gist_id);
              assert.notEqual(user.gist_id, payload.gist_id);
              assert.equal(user.email, seedUser.email);
              assert.notEqual(user.email, payload.email);
              assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.deepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
    it('should error with non-existent ID', (done) => {
      request(app)
        .put(`/users/${uuidThatDNE}`)
        .send(putPayloadWithCurrPassword)
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.idDNE(uuidThatDNE));
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, seedUser.username);
              assert.notEqual(user.username, payload.username);
              assert.equal(user.gist_id, seedUser.gist_id);
              assert.notEqual(user.gist_id, payload.gist_id);
              assert.equal(user.email, seedUser.email);
              assert.notEqual(user.email, payload.email);
              assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.deepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
    it('should error with invalid fields', (done) => {
      request(app)
        .put(`/users/${seedUser.id}`)
        .set('Cookie', `token=${seedToken}`)
        .send({ ...putPayloadWithCurrPassword, bad: 'field' })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalid(['bad']));
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, seedUser.username);
              assert.notEqual(user.username, payload.username);
              assert.equal(user.gist_id, seedUser.gist_id);
              assert.notEqual(user.gist_id, payload.gist_id);
              assert.equal(user.email, seedUser.email);
              assert.notEqual(user.email, payload.email);
              assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.deepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
    it('should error with invalid gistId', (done) => {
      request(app)
        .put(`/users/${seedUser.id}`)
        .set('Cookie', `token=${seedToken}`)
        .send({ ...putPayloadWithCurrPassword, gist_id: invalidGistId })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.gistDNE(invalidGistId));
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, seedUser.username);
              assert.notEqual(user.username, payload.username);
              assert.equal(user.gist_id, seedUser.gist_id);
              assert.notEqual(user.gist_id, payload.gist_id);
              assert.equal(user.email, seedUser.email);
              assert.notEqual(user.email, payload.email);
              assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.deepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
    it('should error with invalid current password before checking gist', (done) => {
      request(app)
        .put(`/users/${seedUser.id}`)
        .set('Cookie', `token=${seedToken}`)
        .send({ ...putPayloadWithInvalidCurrPassword, gist_id: invalidGistId })
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidCurrPwd);
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, seedUser.username);
              assert.notEqual(user.username, payload.username);
              assert.equal(user.gist_id, seedUser.gist_id);
              assert.notEqual(user.gist_id, payload.gist_id);
              assert.equal(user.email, seedUser.email);
              assert.notEqual(user.email, payload.email);
              assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.deepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
    it('should error with invalid ballin-scripts gistId', (done) => {
      request(app)
        .put(`/users/${seedUser.id}`)
        .set('Cookie', `token=${seedToken}`)
        .send({ ...putPayloadWithCurrPassword, gist_id: invalidBSGistId })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidBSGist);
          return knex('users')
            .where('id', seedUser.id)
            .first()
            .then((user) => {
              assert.equal(user.username, seedUser.username);
              assert.notEqual(user.username, payload.username);
              assert.equal(user.gist_id, seedUser.gist_id);
              assert.notEqual(user.gist_id, payload.gist_id);
              assert.equal(user.email, seedUser.email);
              assert.notEqual(user.email, payload.email);
              assert.equal(user.hashed_pwd, seedUser.hashed_pwd);
              assert.equal(user.name, seedUser.name);
              assert.equal(user.id, seedUser.id);
              assert.deepEqual(user.created_at, user.updated_at);
            })
            .then(done);
        });
    });
  });
  describe('DELETE', () => {
    it('should delete user', (done) => {
      request(app)
        .delete(`/users/${seedUser.id}`)
        .send({ currentPassword: validCurrPwd })
        .set('Cookie', `token=${seedToken}`)
        .expect(204)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          return knex('users')
            .where('id', seedUser.id)
            .then((user) => {
              assert.lengthOf(user, 0);
            })
            .then(done);
        });
    });
    it('should error with invalid currPassword', (done) => {
      request(app)
        .delete(`/users/${seedUser.id}`)
        .send({ currentPassword: invalidCurrPwd })
        .set('Cookie', `token=${seedToken}`)
        .expect(401)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidCurrPwd);
          return knex('users')
            .where('id', seedUser.id)
            .then((user) => {
              assert.lengthOf(user, 1);
            })
            .then(done);
        });
    });
    it('should error without currPassword', (done) => {
      request(app)
        .delete(`/users/${seedUser.id}`)
        .set('Cookie', `token=${seedToken}`)
        .expect(401)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.missingCurrPwd);
          return knex('users')
            .where('id', seedUser.id)
            .then((user) => {
              assert.lengthOf(user, 1);
            })
            .then(done);
        });
    });
    it('should error with no token', (done) => {
      request(app)
        .delete(`/users/${seedUser.id}`)
        .send({ currentPassword: validCurrPwd })
        .expect(403)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.noToken);
          return knex('users')
            .where('id', seedUser.id)
            .then((user) => {
              assert.lengthOf(user, 1);
            })
            .then(done);
        });
    });
    it('should error with invalid token', (done) => {
      request(app)
        .delete(`/users/${seedUser.id}`)
        .set('Cookie', `token=${invalidToken}`)
        .send({ currentPassword: validCurrPwd })
        .expect(403)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidJWT);
          return knex('users')
            .where('id', seedUser.id)
            .then((user) => {
              assert.lengthOf(user, 1);
            })
            .then(done);
        });
    });
    it('should error with unauthorized token', (done) => {
      request(app)
        .delete(`/users/${seedUser.id}`)
        .set('Cookie', `token=${wrongUserToken}`)
        .send({ currentPassword: validCurrPwd })
        .expect(403)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.unauthorized);
          return knex('users')
            .where('id', seedUser.id)
            .then((user) => {
              assert.lengthOf(user, 1);
            })
            .then(done);
        });
    });
    it('should error with non-existent ID', (done) => {
      request(app)
        .delete(`/users/${uuidThatDNE}`)
        .send({ currentPassword: validCurrPwd })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.idDNE(uuidThatDNE));
          return knex('users')
            .then((users) => {
              assert.lengthOf(users, 1);
            })
            .then(done);
        });
    });
  });
});
