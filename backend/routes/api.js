const express = require('express');
const UserController = require('../controllers/userController');
const { validateUser } = require('../middleware/validator');

const router = express.Router();

router.post('/', validateUser, UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);

module.exports = router;
