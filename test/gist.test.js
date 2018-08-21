const { assert } = require('chai');
const fetchGistFiles = require('../api/gist');

describe('gist API', () => {
  it('should return array with null gistID', (done) => {
    fetchGistFiles(null).then((res) => {
      assert.isArray(res);
      assert.lengthOf(res, 0);
    });
    done();
  });
  it('should return non-empty array with working gistID', (done) => {
    fetchGistFiles(process.env.JBALLIN_GIST_ID).then((res) => {
      assert.isArray(res);
      assert.isString(res[2]);
    });
    done();
  });
});