module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/sweet_dev',
  },
  test: {
    client: 'pg',
    connection: 'postgres://localhost/sweet_test',
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  },
};
