/* eslint-disable prefer-arrow-callback, func-names */

const { assert } = require('chai');
const { fetchGistFiles } = require('../src/api/gist');

const gistId = process.env.GIST_ID;

describe('gist API', () => {
  it('should return array with null gistID', (done) => {
    fetchGistFiles(null).then((res) => {
      assert.isArray(res);
      assert.lengthOf(res, 0);
    });
    done();
  });
  it('should return non-empty array with working gistID', function (done) {
    if (!gistId) this.skip();

    fetchGistFiles(gistId).then((res) => {
      assert.isArray(res);
      assert.isString(res[2]);
    });
    done();
  });
});
