const ExcelJS = require('exceljs');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const stream = require('stream');

const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: "/etc/secrets/examease-435712-56128730b299.json",
});

const bucketName = 'examease_bucket';

// Function to upload Excel file to GCS
async function uploadExcelToGCS(excelBuffer, excelFilePath) {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(excelFilePath);
    // Upload the file to GCS
    await file.save(excelBuffer);
    console.log(`File uploaded to GCS at: ${excelFilePath}`);

    // Return the public URL of the uploaded file
    return `https://storage.googleapis.com/${bucketName}/${excelFilePath}`;
}

// Function to generate the Excel file
async function generateExamExcel(exam, year) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(exam.name);

    // Set font style for all cells
    const setFontStyle = (worksheet) => {
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.font = { name: 'Times New Roman' };
            });
        });
    };

    worksheet.addRow(['Examen', exam.name]);
    worksheet.addRow(['Ecole', exam.school]);
    worksheet.addRow(['Classe', exam.className]);
    worksheet.addRow(['Année', year]);
    worksheet.addRow(['Niveau', exam.niveau]);
    worksheet.addRow([exam.module || '']);
    worksheet.addRow();
    worksheet.addRow(['Numéro', 'Nom', 'Prénom', 'Note']);

    exam.notes.forEach((note) => {
        if (note.userInfo.school === exam.school && note.userInfo.className === exam.className) {
            worksheet.addRow([`${note.userInfo.number}`, `${note.userInfo.lastName}`, `${note.userInfo.firstName}`, `${note.userInfo.totalScore}`]);
        }
    });

    // Apply the font style to all cells
    setFontStyle(worksheet);

    const excelBuffer = await workbook.xlsx.writeBuffer();
    const dir = path.join('Excel', exam.niveau, exam.name, exam.school);
    const excelFileName = `${exam.className}.xlsx`;
    const excelFilePath = path.join(dir, excelFileName);

    const fileUrl = await uploadExcelToGCS(excelBuffer, excelFilePath);
    return fileUrl;
}

module.exports = {
    generateExamExcel
};
