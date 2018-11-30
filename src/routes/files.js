const express = require('express');
const ctrl = require('../controllers/files');

const router = express.Router();

router.get('/', ctrl.getFiles);

module.exports = router;
