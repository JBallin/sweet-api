const express = require('express');
const ctrl = require('../controllers/login');
const { validateLogin } = require('../utils/validators');

const router = express.Router();

router.post('/', validateLogin, ctrl.login);

module.exports = router;
