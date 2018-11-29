const { NODE_ENV } = process.env;

const createError = (status, message, err) => {
  if (err && NODE_ENV !== 'test') console.error(err.message); // eslint-disable-line no-console
  return ({ error: { status, message } });
};

module.exports = {
  // DB
  usersDB: e => createError(500, 'Error fetching users from database', e),
  userDB: e => createError(500, 'Error fetching user from database', e),
  addUserDB: e => createError(500, 'Error adding user to database', e),
  userUpdateDB: e => createError(500, 'Error updating user in database', e),
  deleteUserDB: e => createError(500, 'Error deleting user from database', e),
  // GET
  uuid: id => createError(400, `Invalid UUID '${id}'`),
  idDNE: id => createError(400, `No user with ID '${id}'`),
  // POST
  noBody: createError(400, 'No body'),
  missing: fields => createError(400, `Missing fields: ${fields.join(', ').trim(',')}`),
  unique: (field, key) => createError(400, `User with ${field} '${key}' already exists`),
  extra: fields => createError(400, `Extra fields: ${fields.join(', ').trim(',')}`),
  // PUT
  invalid: fields => createError(400, `Invalid fields: ${fields.join(', ').trim(',')}`),
  // LOGIN
  missingLogin: createError(400, 'Missing email or password'),
  invalidLogin: createError(401, 'Invalid credentials. Please try again.'),
  bcrypt: e => createError(500, 'Error comparing password', e),
  updatePwd: createError(500, 'Error updating password'),
  // LOGOUT
  logout: e => createError(500, 'Error logging out', e),
  // GITHUB
  githubAPILimit: createError(500, 'GitHub API rate limit exceeded'),
  gistDNE: id => createError(400, `No gist with ID '${id}'`),
  gistErr: e => createError(500, 'Error fetching gist', e),
  noGistId: createError(400, 'No gist ID provided'),
  invalidBSGist: createError(400, 'Invalid ballin-scripts gist'),
};
