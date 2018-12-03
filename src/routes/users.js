const express = require('express');
const ctrl = require('../controllers/users');
const {
  validateUser, validateId, validateUserUpdate, validateGistId, validateJWT,
} = require('../utils/validators');

const router = express.Router();

router.get('/', ctrl.getAllUsers);
router.get('/:id', validateId, validateJWT, ctrl.getUser);
router.post('/', validateUser, validateGistId, ctrl.createUser);
router.put('/:id', validateId, validateUserUpdate, validateJWT, ctrl.updateUser);
router.delete('/:id', validateId, validateJWT, ctrl.deleteUser);

module.exports = router;
