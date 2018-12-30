const { assert } = require('chai');
const { fetchGistFiles } = require('../src/utils/gistAPI');
const { seeds } = require('../seeds/001users');

const gistId = seeds[0].gist_id;

describe('gist API', () => {
  it('should return array with null gistID', (done) => {
    fetchGistFiles(null).then((res) => {
      assert.isArray(res);
      assert.lengthOf(res, 0);
    });
    done();
  });
  it('should return non-empty array with working gistID', (done) => {
    fetchGistFiles(gistId).then((res) => {
      if (res.error) {
        done(Error(res.error.message));
      } else {
        assert.isArray(res);
        assert.isString(res[0]);
        done();
      }
    });
  });
});
