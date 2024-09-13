const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId, // References the teacher who created the exam
    ref: 'Teacher',
    required: true,
  },
  module: String,
  niveau: String,
  parties: [
    {
      name: {
        type: String,
        required: true,
      },
      exercises: [
        {
          type: {
            type: String, // Specifies the type of exercise, e.g., "QCM", "ShortAnswer", etc.
            required: true,
          },
          data: {
            type: mongoose.Schema.Types.Mixed, // Stores exercise-specific data based on the type
            required: true,
          },
        },
      ],
    },
  ],
  answers: [
    {
      _id: String,
      userInfo:
        {
          lastName: String,
          firstName: String,
          number: String,
          school: String,
          className: String,
          totalScore: Number,
          fileUrl: String
        },
    }
  ],
  access: [
    {
      type: Map,
      of: String,
    },
  ],
}, { timestamps: true });

const Exam = mongoose.model('Exam', ExamSchema);

module.exports = Exam;
