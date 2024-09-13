const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');
const { createPDF } = require('./ExamPDF');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up static file serving for the assets folder
app.use('/assets', express.static('assets'));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'assets'); // Save files to the assets folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Use a unique filename
  }
});

const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Route to handle image upload
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ imageUrl: `http://localhost:5000/assets/${req.file.filename}` });
  } else {
    res.status(400).json({ error: 'Image upload failed' });
  }
});

app.post('/api/create-document', async (req, res) => {
  try {
    const { examName, module, note, school, className, year, lastName, firstName, number, parties, studentQCM, studentCLD, studentCLT, studentRPF, studentRLV, studentRLE, studentOLE } = req.body;

    if (!examName || !module || !note || !school || !className || !year || !lastName || !firstName || !number || !parties) {
      return res.status(400).send('Missing required fields');
    }

    const fileUrl = await createPDF({ examName, module, note, school, className, year, lastName, firstName, number, parties, studentQCM, studentCLD, studentCLT, studentRPF, studentRLV, studentRLE, studentOLE });

    res.json({ fileUrl });
  } catch (error) {
    res.status(500).send(`Internal Server Error ${error}`);
  }
});

app.post('/api/download-zip', async (req, res) => {
  const { school, class: selectedClass } = req.body;

  const directory = './files';
  const zip = new JSZip();
  let zipFilename = 'files.zip'; // Default filename

  if (school) {
    if (selectedClass) {
      // If both a school and a class are selected
      zipFilename = `${selectedClass}.zip`;

      const schoolPath = path.join(directory, school);
      if (fs.statSync(schoolPath).isDirectory()) {
        const classPath = path.join(schoolPath, selectedClass);
        if (fs.statSync(classPath).isDirectory()) {
          const classZipFolder = zip.folder(selectedClass);

          const pdfFiles = fs.readdirSync(classPath).filter(file => path.extname(file) === '.pdf');

          pdfFiles.forEach(pdf => {
            const filePath = path.join(classPath, pdf);
            const fileData = fs.readFileSync(filePath);
            classZipFolder.file(pdf, fileData);
          });
        }
      }
    } else {
      // If only a school is selected
      zipFilename = `${school}.zip`;

      const schoolPath = path.join(directory, school);
      if (fs.statSync(schoolPath).isDirectory()) {
        const schoolZipFolder = zip.folder(school);

        const classDirectories = fs.readdirSync(schoolPath);

        classDirectories.forEach(classDirectory => {
          const classPath = path.join(schoolPath, classDirectory);
          if (fs.statSync(classPath).isDirectory()) {
            const classZipFolder = schoolZipFolder.folder(classDirectory);

            const pdfFiles = fs.readdirSync(classPath).filter(file => path.extname(file) === '.pdf');

            pdfFiles.forEach(pdf => {
              const filePath = path.join(classPath, pdf);
              const fileData = fs.readFileSync(filePath);
              classZipFolder.file(pdf, fileData);
            });
          }
        });
      }
    }
  } else {
    // If neither is selected
    zipFilename = 'leTout.zip';

    const allSchools = fs.readdirSync(directory);

    allSchools.forEach(schoolDirectory => {
      const schoolPath = path.join(directory, schoolDirectory);
      if (fs.statSync(schoolPath).isDirectory()) {
        const schoolZipFolder = zip.folder(schoolDirectory);

        const classDirectories = fs.readdirSync(schoolPath);

        classDirectories.forEach(classDirectory => {
          const classPath = path.join(schoolPath, classDirectory);
          if (fs.statSync(classPath).isDirectory()) {
            const classZipFolder = schoolZipFolder.folder(classDirectory);

            const pdfFiles = fs.readdirSync(classPath).filter(file => path.extname(file) === '.pdf');

            pdfFiles.forEach(pdf => {
              const filePath = path.join(classPath, pdf);
              const fileData = fs.readFileSync(filePath);
              classZipFolder.file(pdf, fileData);
            });
          }
        });
      }
    });
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  res.set('Content-Type', 'application/zip');
  res.set('Content-Disposition', `attachment; filename="${zipFilename}"`);
  res.set('Access-Control-Expose-Headers', 'Content-Disposition'); // Expose the Content-Disposition header
  res.send(zipBuffer);
});



// Static folder to serve the files
app.use('/files', express.static(path.join(__dirname, 'files')));


const loginRoutes = require('./routes/login');
const signupRoutes = require('./routes/signup');
const examRoutes = require('./routes/exam');
const teacherRoutes = require('./routes/teacher'); // Add teacher route

app.use('/api/login', loginRoutes);
app.use('/api/signup', signupRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/teacher', teacherRoutes);

// Use the client app
app.use(express.static(path.join(__dirname, '/client/build')));
app.get('*', (req,res)=> res.sendFile(path.join(__dirname, '/client/build/index.html')));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
