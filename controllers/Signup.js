const Teacher = require('../models/Teacher');
const bcrypt = require('bcrypt');

const signupTeacher = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingTeacher = await Teacher.findOne({ username: username.toUpperCase() });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new teacher
    const newTeacher = new Teacher({
      username,
      password: hashedPassword,
    });

    // Save the teacher to the database
    await newTeacher.save();

    res.status(201).json({ message: 'Teacher registered successfully', teacher: newTeacher });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { signupTeacher };
