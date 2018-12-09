const express = require('express');
const ctrl = require('../controllers/login');
const { validateLoginBody, tryTokenLoginAndStoreId } = require('../utils/validators');

const router = express.Router();

router.post('/', tryTokenLoginAndStoreId, validateLoginBody, ctrl.login);

module.exports = router;
