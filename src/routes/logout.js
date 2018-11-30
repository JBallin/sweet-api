const express = require('express');
const ctrl = require('../controllers/logout');
const { validateJwtKey } = require('../utils/validators');

const router = express.Router();

router.post('/', validateJwtKey, ctrl.logout);

module.exports = router;
