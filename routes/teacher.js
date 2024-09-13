const express = require('express');
const { getTeacherById, getSchoolsAndClasses, addSchool, addClass } = require('../controllers/Teacher');

const router = express.Router();

// Route to get teacher details by ID
router.get('/:id', getTeacherById);
router.get('/:profId/schools', getSchoolsAndClasses);
router.post('/:profId/schools', addSchool);
router.put('/:profId/schools/:schoolName', addClass);

module.exports = router;