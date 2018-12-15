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
  // GIST_ID
  gistDNE: id => `No gist with ID '${id}'`,
  noGistId: 'No gist ID provided',
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
const payloadWithPassword = { ...payload, password: 'hello' };
const invalidCurrPwd = 'invalid';
const validCurrPwd = 'hello';
const putPayloadWithCurrPassword = { ...payload, password: 'new', currentPassword: validCurrPwd };
const putPayloadWithInvalidCurrPassword = { ...payload, password: 'new', currentPassword: invalidCurrPwd };
const uuidThatDNE = 'de455777-255e-4e61-b53c-6dd942f1ad7c';
const seedId = seeds[0].id;
const badId = '1';
const seedToken = createToken({ id: seedId });
const invalidToken = createToken({ id: seedId }, 0);
const wrongUserToken = createToken({ id: uuidThatDNE });

describe('/users', () => {
  describe('GET', () => {
    it('should return users', (done) => {
      request(app)
        .get('/users')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          const { id, username } = seeds[0];
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
        .send({ ...payloadWithPassword, email: seeds[0].email })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.unique('email', seeds[0].email));
          return done();
        });
    });
    it('should error with existing username', (done) => {
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, username: seeds[0].username })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.unique('username', seeds[0].username));
          return done();
        });
    });
    it('should error with existing gist_id', (done) => {
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, gist_id: seeds[0].gist_id })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.unique('gist_id', seeds[0].gist_id));
          return done();
        });
    });
    it('should error with invalid gist_id', (done) => {
      const testId = '2';
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, gist_id: testId })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.gistDNE(testId));
          return done();
        });
    });
    it('should error with invalid ballin-scripts gist_id', (done) => {
      const testId = '1';
      request(app)
        .post('/users')
        .send({ ...payloadWithPassword, gist_id: testId })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidBSGist);
          return done();
        });
    });
  });
});

describe('/users/:id', () => {
  describe('GET', () => {
    it('should return user', (done) => {
      request(app)
        .get(`/users/${seedId}`)
        .set('Cookie', [`token=${seedToken}`])
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.name, seeds[0].name);
          assert.equal(res.body.username, seeds[0].username);
          return done();
        });
    });
    it('should error with no token', (done) => {
      request(app)
        .get(`/users/${seedId}`)
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
        .get(`/users/${seedId}`)
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
        .get(`/users/${seedId}`)
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
    it('should update user', (done) => {
      request(app)
        .put(`/users/${seedId}`)
        .set('Cookie', `token=${seedToken}`)
        .send(putPayloadWithCurrPassword)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          return knex('users')
            .where('id', seedId)
            .first()
            .then((user) => {
              assert.equal(payload.username, user.username);
              assert.equal(payload.name, user.name);
              assert.equal(user.id, seedId);
              assert.notDeepEqual(user.created_at, user.updated_at);
              return done();
            });
        });
    });
    it('should error with no token', (done) => {
      request(app)
        .put(`/users/${seedId}`)
        .send(putPayloadWithCurrPassword)
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
        .put(`/users/${seedId}`)
        .set('Cookie', `token=${invalidToken}`)
        .send(putPayloadWithCurrPassword)
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
        .put(`/users/${seedId}`)
        .set('Cookie', `token=${wrongUserToken}`)
        .send(putPayloadWithCurrPassword)
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.unauthorized);
          return done();
        });
    });
    it('should error with empty body (but with current password)', (done) => {
      request(app)
        .put(`/users/${seedId}`)
        .set('Cookie', `token=${seedToken}`)
        .send({ currentPassword: validCurrPwd })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.noBody);
          return done();
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
          return done();
        });
    });
    it('should error with invalid fields', (done) => {
      request(app)
        .put(`/users/${seedId}`)
        .send({ ...putPayloadWithCurrPassword, bad: 'field' })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalid(['bad']));
          return done();
        });
    });
  });
  describe('DELETE', () => {
    it('should delete user', (done) => {
      request(app)
        .delete(`/users/${seedId}`)
        .send({ currentPassword: validCurrPwd })
        .set('Cookie', `token=${seedToken}`)
        .expect(204)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          return knex('users')
            .where('id', seedId)
            .then((user) => {
              assert.lengthOf(user, 0);
            })
            .then(done);
        });
    });
    it('should error with no token', (done) => {
      request(app)
        .delete(`/users/${seedId}`)
        .send({ currentPassword: validCurrPwd })
        .expect(403)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.noToken);
          return done();
        });
    });
    it('should error with invalid token', (done) => {
      request(app)
        .delete(`/users/${seedId}`)
        .set('Cookie', `token=${invalidToken}`)
        .send({ currentPassword: validCurrPwd })
        .expect(403)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.invalidJWT);
          return done();
        });
    });
    it('should error with unauthorized token', (done) => {
      request(app)
        .delete(`/users/${seedId}`)
        .set('Cookie', `token=${wrongUserToken}`)
        .send({ currentPassword: validCurrPwd })
        .expect(403)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          assert.equal(res.body.error, errors.unauthorized);
          return done();
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
          return done();
        });
    });
  });
});
