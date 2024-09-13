const Teacher = require('../models/Teacher');

const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id).select('username'); // Only select username field

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ username: teacher.username });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSchoolsAndClasses = async (req, res) => {
  try {
    const { profId } = req.params;
    const teacher = await Teacher.findById(profId).select('schools');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ schools: teacher.schools });
  } catch (error) {
    console.error('Error fetching schools and classes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addSchool = async (req, res) => {
  try {
    const { school } = req.body;
    const teacher = await Teacher.findById(req.params.profId);
    if (!teacher) return res.status(404).send('Teacher not found');
    
    teacher.schools.push({ school, classes: [] });
    await teacher.save();
    
    res.status(200).json(teacher.schools);
  } catch (error) {
    res.status(500).send('Server error');
  }
};

const addClass = async (req, res) => {
  try {
    const { className } = req.body;
    const teacher = await Teacher.findById(req.params.profId);
    if (!teacher) return res.status(404).send('Teacher not found');

    const school = teacher.schools.find(s => s.school === req.params.schoolName);
    if (!school) return res.status(404).send('School not found');

    school.classes.push(className);
    await teacher.save();

    res.status(200).json(school.classes);
  } catch (error) {
    res.status(500).send('Server error');
  }
};


module.exports = { getTeacherById, getSchoolsAndClasses, addSchool, addClass };
