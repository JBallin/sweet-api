const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const fileTypesRouter = require('./routes/fileTypes');
const filesRouter = require('./routes/files');
const validateGistRouter = require('./routes/validateGist');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');

const app = express();
app.disable('x-powered-by');

if (!process.env.NODE_ENV) app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));
const corsOptions = {
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

app.use('/users', usersRouter);
app.use('/categories', categoriesRouter);
app.use('/fileTypes', fileTypesRouter);
app.use('/files', filesRouter);
app.use('/validateGist', validateGistRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

module.exports = app;
