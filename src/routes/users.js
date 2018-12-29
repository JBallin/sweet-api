const express = require('express');
const ctrl = require('../controllers/users');
const filesCtrl = require('../controllers/files');
const {
  validateUser, validateId, validateUserUpdate, validateGistId, validateJWT,
  validateCurrPwdSent, validateGistIdIfExists,
} = require('../utils/validators');

const router = express.Router();

router.get('/', ctrl.getAllUsers);
router.get('/:id', validateId, validateJWT, ctrl.getUser);
router.get('/:id/files', validateId, validateJWT, filesCtrl.getFiles);
router.post('/', validateUser, validateGistId, ctrl.createUser);
router.put('/:id', validateId, validateCurrPwdSent, validateJWT, validateUserUpdate, validateGistIdIfExists, ctrl.updateUser);
router.delete('/:id', validateId, validateCurrPwdSent, validateJWT, ctrl.deleteUser);

module.exports = router;
