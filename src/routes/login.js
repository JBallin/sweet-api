const express = require('express');
const ctrl = require('../controllers/login');
const { validateLoginBody } = require('../utils/validators');

const router = express.Router();

router.post('/', validateLoginBody, ctrl.login);

module.exports = router;
