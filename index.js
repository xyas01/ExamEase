const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const JSZip = require('jszip');
const path = require('path');
const path = require('path');
const { createPDF } = require('./ExamPDF');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
// Initialize the GCS client
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: "examease-435712-56128730b299.json", // Path to your GCS service account key file
});
const bucketName = 'examease_bucket'; // Your Google Cloud bucket name

// Set up static file serving for the assets folder
app.use('/assets', express.static('assets'));

// Set up multer for file uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'assets'); // Save files to the assets folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Use a unique filename
  }
});

const upload = multer({ multerStorage });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Route to handle image upload
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ imageUrl: `https://examease-hzc8.onrender.com/assets/${req.file.filename}` });
  } else {
    res.status(400).json({ error: 'Image upload failed' });
  }
});

app.post('/api/create-document', async (req, res) => {
  try {
    const { examName, module, niveau, note, school, className, year, lastName, firstName, number, parties, studentQCM, studentCLD, studentCLT, studentRPF, studentRLV, studentRLE, studentOLE } = req.body;

    if (!examName || !module || !niveau || !note || !school || !className || !year || !lastName || !firstName || !number || !parties) {
      return res.status(400).send('Missing required fields');
    }

    const fileUrl = await createPDF({ examName, module, niveau, note, school, className, year, lastName, firstName, number, parties, studentQCM, studentCLD, studentCLT, studentRPF, studentRLV, studentRLE, studentOLE });

    res.json({ fileUrl });
  } catch (error) {
    res.status(500).send(`Internal Server Error ${error}`);
  }
});

// Function to list files from GCS folder (prefix)
async function listFilesInGCSFolder(prefix) {
  const bucket = storage.bucket(bucketName);
  const [files] = await bucket.getFiles({ prefix });
  return files; // Array of file objects
}

// Function to download file data from GCS
async function downloadFileFromGCS(file) {
  const [fileData] = await file.download();
  return fileData;
}

// POST endpoint to download the ZIP with GCS files
app.post('/api/download-zip', async (req, res) => {
  const { niveau, examName, school, class: selectedClass } = req.body;

  const zip = new JSZip();
  let zipFilename = 'files.zip'; // Default filename

  try {
    // Normalize the base directory to use forward slashes
    const baseDirectory = path.join(niveau, examName); // Base GCS prefix

    if (school) {
      if (selectedClass) {
        // If both a school and a class are selected
        zipFilename = `${selectedClass}.zip`;
        const classFolderPath = path.join(baseDirectory, school, selectedClass) + '\\'; // GCS prefix for class
        const files = await listFilesInGCSFolder(classFolderPath);

        // Add each PDF file to the ZIP
        for (const file of files) {
          if (file.name.endsWith('.pdf')) {
            const fileData = await downloadFileFromGCS(file);
            const relativePath = file.name.replace(classFolderPath, ''); // Normalize path for ZIP
            zip.file(relativePath, fileData);
          }
        }
      } else {
        // If only a school is selected
        zipFilename = `${school}.zip`;
        const schoolFolderPath = path.join(baseDirectory, school) + '\\'; // GCS prefix for school

        const files = await listFilesInGCSFolder(schoolFolderPath);

        // Add each file to the ZIP, maintaining folder structure
        for (const file of files) {
          if (file.name.endsWith('.pdf')) {
            const fileData = await downloadFileFromGCS(file);
            const relativePath = file.name.replace(schoolFolderPath, ''); // Normalize path for ZIP
            zip.file(relativePath, fileData);
          }
        }
      }
    } else {
      // If neither school nor class is selected, zip everything under examName and niveau
      zipFilename = `${examName}.zip`;

      const allFiles = await listFilesInGCSFolder(baseDirectory + '\\'); // Get all files in the base directory (niveau/examName)

      // Add each file to the ZIP, maintaining the GCS folder structure
      for (const file of allFiles) {
        if (file.name.endsWith('.pdf')) {
          const fileData = await downloadFileFromGCS(file);
          const relativePath = file.name.replace(baseDirectory + '\\', ''); // Normalize path for ZIP
          zip.file(relativePath, fileData);
        }
      }
    }

    // Generate the ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.set('Access-Control-Expose-Headers', 'Content-Disposition'); // Expose the Content-Disposition header
    res.send(zipBuffer);
  } catch (error) {
    console.error('Error creating ZIP:', error);
    res.status(500).send('Failed to create ZIP file.');
  }
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
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/client/build/index.html')));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
