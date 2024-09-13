const express = require('express');
const { signupTeacher } = require('../controllers/Signup');

const router = express.Router();

// Route to handle teacher signup
router.post('/', signupTeacher);

module.exports = router;
