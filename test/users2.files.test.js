const request = require('supertest');
const { assert } = require('chai');
const app = require('../src/app');
const { formatErr } = require('./utils/errors');
const { seeds } = require('../seeds/001users');
const { createToken } = require('../src/utils/auth');

const errors = {
  // ID
  uuid: id => `Invalid UUID '${id}'`,
  idDNE: id => `No user with ID '${id}'`,
  // TOKEN
  invalidJWT: 'Invalid token',
  unauthorized: 'Unauthorized',
  noToken: 'Missing token',
};

const seedId = seeds[0].id;
const badId = '1';
const uuidThatDNE = 'de455777-255e-4e61-b53c-6dd942f1ad7c';
const seedToken = createToken({ id: seedId });
const invalidToken = createToken({ id: seedId }, 0);
const wrongUserToken = createToken({ id: uuidThatDNE });

const baseFile = { title: '.MyConfig', extension: '.md' };

describe('/users/:id/files', () => {
  describe('GET', () => {
    it('should get files', (done) => {
      request(app)
        .get(`/users/${seedId}/files`)
        .set('Cookie', [`token=${seedToken}`])
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(formatErr(err, res));
          const baseFileIndex = res.body
            .findIndex(({ category, files }) => category === 'Other' && files
              .find(({ title, extension }) => (
                title === baseFile.title && extension === baseFile.extension
              )));
          assert.notEqual(baseFileIndex, -1);
          return done();
        });
    });
    it('should error with no token', (done) => {
      request(app)
        .get(`/users/${seedId}/files`)
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
        .get(`/users/${seedId}/files`)
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
        .get(`/users/${seedId}/files`)
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
        .get(`/users/${badId}/files`)
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
        .get(`/users/${uuidThatDNE}/files`)
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
