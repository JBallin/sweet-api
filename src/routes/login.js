const express = require('express');
const ctrl = require('../controllers/login');
const { validateLoginBody, validateJwtKey } = require('../utils/validators');

const router = express.Router();

router.post('/', validateLoginBody, validateJwtKey, ctrl.login);

module.exports = router;
