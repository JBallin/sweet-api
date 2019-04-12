const express = require('express');
const ctrl = require('../controllers/users');
const filesCtrl = require('../controllers/files');
const {
  validateUser, validateId, validateUserUpdate, validateGistId, validateJWT,
  validateCurrPwd, validateGistIdIfExists, validateNotDemo,
} = require('../utils/validators');

const router = express.Router();

router.get('/', ctrl.getAllUsers);
router.get('/:id', validateId, validateJWT, ctrl.getUser);
router.get('/:id/files', validateId, validateJWT, filesCtrl.getFiles);
router.post('/', validateUser, validateGistId, ctrl.createUser);
router.put('/:id', validateId, validateCurrPwd, validateJWT, validateUserUpdate, validateGistIdIfExists, validateNotDemo, ctrl.updateUser);
router.delete('/:id', validateId, validateCurrPwd, validateJWT, validateNotDemo, ctrl.deleteUser);

module.exports = router;
