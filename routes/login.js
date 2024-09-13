const express = require('express');
const { login } = require('../controllers/Login');

const router = express.Router();

// Teacher login route
router.post('/', login);

module.exports = router;
