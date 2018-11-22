const express = require('express');
const ctrl = require('../controllers/gist');

const router = express.Router();

router.post('/', ctrl.validateGist);

module.exports = router;
