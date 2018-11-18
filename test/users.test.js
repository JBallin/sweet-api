const request = require('supertest');
const { assert } = require('chai');
const app = require('../src/app');
const { seeds } = require('../seeds/001users');
const knex = require('../knex');

const seedUser1 = {
  username: 'super_coder',
  name: 'Linus Torvalds',
  email: 'git_creator@gmai.com',
  id: 2,
  gistId: 1234,
  password: 'hello',
};

const badUser = {
  nombre: 'paul',
  content: 'this thing on?',
  followup: 'anyone there?',
};

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
        .send(seedUser1)
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          const { username, name } = seedUser1;
          assert.deepEqual(res.body, {
            username, name, id: seeds.length,
          });
          return done();
        });
    });
    it('should error with empty body', (done) => {
      request(app)
        .post('/users')
        .expect(400)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.text, 'ERROR: Invalid body');
          return done();
        });
    });
    it('should error with invalid body', (done) => {
      request(app)
        .post('/users')
        .send(badUser)
        .expect(400)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.text, 'ERROR: Invalid body');
          return done();
        });
    });
  });
});

        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });
});
