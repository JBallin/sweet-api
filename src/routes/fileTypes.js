const express = require('express');
const ctrl = require('../controllers/fileTypes');

const router = express.Router();

router.get('/', ctrl.getFileTypes);

module.exports = router;
