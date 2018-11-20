const express = require('express');
const ctrl = require('../controllers/users');
const { validateUser, validateId } = require('../utils/validators');

const router = express.Router();

router.get('/', ctrl.getAllUsers);
router.get('/:id', validateId, ctrl.getUser);
router.post('/', validateUser, ctrl.createUser);
router.put('/:id', validateId, validateUser, ctrl.editUser);
router.delete('/:id', validateId, ctrl.deleteUser);

module.exports = router;
