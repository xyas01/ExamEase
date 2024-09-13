const Exam = require('../models/Exam');

const createExam = async (req, res) => {
  const { name, creator, module, access } = req.body;

  // Ensure access is an array of maps
  const formattedAccess = access.map((entry) => {
    const [lycee, cls] = Object.entries(entry)[0];
    return new Map([[lycee, cls]]);
  });

  try {
    const newExam = new Exam({ name, creator, module, access: formattedAccess });
    await newExam.save();
    
    // Return the exam ID in the response
    res.status(201).json({ message: 'Examen créé avec succès', examId: newExam._id });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de l'examen", error });
  }
};


// Get all exams
const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate('creator', 'username'); // Populating the creator with username
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exams', error });
  }
};

// Get a single exam by ID
const getExamById = async (req, res) => {
  const { id } = req.params;

  try {
    const exam = await Exam.findById(id).populate('creator', 'username');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam', error });
  }
};

// Update an exam by ID
const updateExamById = async (req, res) => {
  const { id } = req.params;
  const { name, parties, answers, module, access } = req.body; // Update to include parties instead of exercises

  try {
    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      {
        name,
        module,
        parties, // Include parties in the update
        answers,
        access, // Include access in the update
      },
      { new: true } // Return the updated document
    );

    if (!updatedExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.status(200).json(updatedExam);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update exam', error });
  }
};


// Add or update a student's answer
const addStudentAnswer = async (req, res) => {
    const { id } = req.params; // Exam ID
    const { studentName, grade } = req.body;
  
    try {
      // Find the exam by ID
      const exam = await Exam.findById(id);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      // Update or add the student's grade in the answers map
      exam.answers.set(studentName, grade);
  
      // Save the updated exam
      await exam.save();
  
      res.status(200).json({ message: 'Answer added/updated successfully', exam });
    } catch (error) {
      res.status(500).json({ message: 'Error updating answer', error });
    }
};

// Delete an exam by ID
const deleteExam = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExam = await Exam.findByIdAndDelete(id);
    if (!deletedExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exam', error });
  }
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExamById,
  deleteExam,
  addStudentAnswer,
};
