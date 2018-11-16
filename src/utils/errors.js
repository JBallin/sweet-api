const createError = (status, message, err) => {
  if (err) console.error(err.message); // eslint-disable-line no-console
  return ({ error: { status, message } });
};

module.exports = { createError };
