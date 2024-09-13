const express = require('express');
const {
  createExam,
  getAllExams,
  getExamById,
  updateExamById,
  addStudentAnswer,
  deleteExam,
} = require('../controllers/Exam');

const router = express.Router();

// Route to create a new exam
router.post('/', createExam);

// Route to get all exams
router.get('/', getAllExams);

// Route to get a single exam by ID
router.get('/:id', getExamById);

// Route to update an exam by ID
router.put('/:id', updateExamById);

// Route to add an answer
router.put('/:id/answer', addStudentAnswer);

// Route to delete an exam by ID
router.delete('/:id', deleteExam);

module.exports = router;
