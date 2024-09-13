const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  schools: [{
    school: {
      type: String,
    },
    classes: [{
      type: String,
    }]
  }]
});

const Teacher = mongoose.model('Teacher', TeacherSchema);

module.exports = Teacher;
