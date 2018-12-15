const { NODE_ENV, DEBUG } = process.env;

const createError = (status, message, err) => {
  if (err && (NODE_ENV !== 'test' || DEBUG === 'true')) console.error(err.message || err); // eslint-disable-line no-console
  return ({ error: { status, message } });
};

module.exports = {
  // DB
  fetchDB: (data, e) => createError(500, `Error fetching ${data} from database`, e),
  addUserDB: e => createError(500, 'Error adding user to database', e),
  userUpdateDB: e => createError(500, 'Error updating user in database', e),
  deleteUserDB: e => createError(500, 'Error deleting user from database', e),
  categorizedFilesJoinDB: e => createError(500, 'Error joining categories and file_types', e),
  // GET
  uuid: id => createError(400, `Invalid UUID '${id}'`),
  idDNE: id => createError(400, `No user with ID '${id}'`),
  // POST
  noBody: createError(400, 'No body'),
  missing: fields => createError(400, `Missing fields: ${fields.join(', ').trim(',')}`),
  unique: (field, key) => createError(400, `User with ${field} '${key}' already exists`),
  extra: fields => createError(400, `Extra fields: ${fields.join(', ').trim(',')}`),
  // PUT/DELETE
  invalid: fields => createError(400, `Invalid fields: ${fields.join(', ').trim(',')}`),
  invalidCurrPwd: createError(401, 'Invalid current password'),
  missingCurrPwd: createError(401, 'Missing current password'),
  updatePwd: createError(500, 'Error updating password'),
  // LOGIN
  missingLogin: createError(400, 'Missing email or password'),
  invalidLogin: createError(401, 'Invalid credentials. Please try again.'),
  bcrypt: e => createError(500, 'Error comparing password', e),
  jwtKeyMissing: createError(500, 'Missing JWT_KEY'),
  // LOGOUT
  logout: e => createError(500, 'Error logging out', e),
  // GITHUB
  githubAPILimit: createError(500, 'GitHub API rate limit exceeded'),
  gistDNE: id => createError(400, `No gist with ID '${id}'`),
  gistErr: e => createError(500, 'Error fetching gist', e),
  noGistId: createError(400, 'No gist ID provided'),
  invalidBSGist: createError(400, 'Invalid ballin-scripts gist'),
  githubAPIError: e => createError(500, 'Error fetching GitHub API', e),
  // JWT
  invalidJWT: e => createError(403, 'Invalid token', e),
  unauthorized: createError(403, 'Unauthorized'),
  noToken: createError(403, 'Missing token'),
};
