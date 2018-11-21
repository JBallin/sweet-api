const request = require('supertest');
const { assert } = require('chai');
const app = require('../src/app');
const { seeds } = require('../seeds/001users');
const knex = require('../knex');

const payload = {
  gist_id: '1234',
  name: 'Linus Torvalds',
  email: 'git_creator@gmail.com',
  username: 'super_coder',
};

const payloadWithPassword = { ...payload, password: 'hello' };

describe('/users', () => {
  describe('GET', () => {
    it('should return users', (done) => {
      request(app)
        .get('/users')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          const { username, name } = seeds[0];
          assert.deepEqual(res.body[0], {
            username, name, id: 1,
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
          if (err) return done(err);
          assert.deepEqual(res.body, payload);
          return done();
        });
    });
    it('should error with missing fields', (done) => {
      request(app)
        .post('/users')
        .send(payload)
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.deepEqual(res.body.error, 'Missing fields: password');
          return done();
        });
    });
    it('should error with empty body', (done) => {
      request(app)
        .post('/users')
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.deepEqual(res.body.error, 'No body');
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
          if (err) return done(err);
          assert.equal(res.body.error, 'Extra fields: extra');
          return done();
        });
    });
  });
});

describe('/users/:id', () => {
  describe('GET', () => {
    it('should return user', (done) => {
      request(app)
        .get('/users/1')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.name, seeds[0].name);
          assert.equal(res.body.username, seeds[0].username);
          return done();
        });
    });
    it('should error with invalid ID', (done) => {
      request(app)
        .get('/users/hello')
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.error, 'ID \'hello\' is not a number');
          return done();
        });
    });
    it('should error with non-existent ID', (done) => {
      request(app)
        .get('/users/0')
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.error, 'No user with ID \'0\'');
          return done();
        });
    });
  });

  describe('PUT', () => {
    it('should update user', (done) => {
      request(app)
        .put('/users/1')
        .send(payload)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err) => {
          if (err) return done(err);
          return knex('users')
            .where('id', 1)
            .first()
            .then((user) => {
              assert.equal(payload.username, user.username);
              assert.equal(payload.name, user.name);
              assert.equal(user.id, 1);
              assert.notDeepEqual(user.created_at, user.updated_at);
              return done();
            });
        });
    });
    it('should error with empty body', (done) => {
      request(app)
        .put('/users/1')
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.error, 'No body');
          return done();
        });
    });
    it('should error with non-existent ID', (done) => {
      request(app)
        .put('/users/0')
        .send(payload)
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.error, 'No user with ID \'0\'');
          return done();
        });
    });
    it('should error with invalid fields', (done) => {
      request(app)
        .put('/users/1')
        .send({ ...payload, bad: 'field' })
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.error, 'Invalid fields: bad');
          return done();
        });
    });
  });
  describe('DELETE', () => {
    it('should delete user', (done) => {
      request(app)
        .delete('/users/1')
        .expect(204)
        .end((err) => {
          if (err) return done(err);
          return knex('users')
            .where('id', 1)
            .then((res) => {
              assert.lengthOf(res, 0);
            })
            .then(done);
        });
    });
    it('should error with non-existent ID', (done) => {
      request(app)
        .delete('/users/0')
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.error, 'No user with ID \'0\'');
          return done();
        });
    });
  });
});
