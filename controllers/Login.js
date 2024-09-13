const Teacher = require('../models/Teacher');
const bcrypt = require('bcrypt'); // Optional but recommended for secure password handling

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Log incoming request data for debugging
    console.log('Login attempt:', { username, password });

    const teacher = await Teacher.findOne({ username });

    if (!teacher) {
      return res.status(404).json({ status: 'error', message: 'Nom d’utilisateur ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Nom d’utilisateur ou mot de passe incorrect' });
    }

    // Return success with teacher ID
    res.json({
      status: 'success',
      id: teacher._id.toString(),
    });
  } catch (error) {
    console.error('Login Error:', error); // Log error details for debugging
    res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
};

module.exports = { login };