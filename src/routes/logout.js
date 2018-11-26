const express = require('express');
const ctrl = require('../controllers/logout');

const router = express.Router();

router.post('/', ctrl.logout);

module.exports = router;
