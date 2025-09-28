const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize the GCS client
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: "examease-435712-56128730b299.json", // Path to your GCS service account key file
});

const bucketName = 'examease-bucket'; // Your Google Cloud bucket name

// Function to upload the PDF to Google Cloud Storage
async function uploadPDFToGCS(pdfBytes, filePath) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);

  // Upload the file to GCS
  await file.save(pdfBytes);
  console.log(`File uploaded to GCS at: ${filePath}`);

  // Return the public URL of the uploaded file
  return `https://storage.googleapis.com/${bucketName}/${filePath}`;
}

async function createPDF({ examName, module, niveau, note, school, className, year, lastName, firstName, number, parties, studentQCM, studentCLD, studentCLT, studentRPF, studentRLV, studentRLE, studentOLE }) {
  try {
    const pdfDoc = await PDFDocument.create();
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Register fontkit to use custom fonts
    pdfDoc.registerFontkit(fontkit);
    const customFontBytes = fs.readFileSync(path.join(__dirname, 'fonts', 'DoulosSILCompact-R.ttf'));
    const customFont = await pdfDoc.embedFont(customFontBytes);

    // Page dimensions and constants
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 36;
    const cellHeight = 20;
    const cellMargin = 5;
    const borderThickness = 4;
    const columnGap = 20;
    const columnWidth = (pageWidth - 2 * margin - columnGap) / 2;

    let pages = [];
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    pages.push(currentPage);
    let currentY = pageHeight - margin;

    // Function to add new page if needed
    function checkPageBreak(requiredSpace) {
      if (currentY - requiredSpace < margin + 50) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        pages.push(currentPage);
        currentY = pageHeight - margin;
        
        // Draw border on new page
        currentPage.drawRectangle({
          x: margin - 10,
          y: margin - 10,
          width: pageWidth - (margin * 2) + 20,
          height: pageHeight - (margin * 2) + 20,
          borderColor: rgb(0, 0, 0),
          borderWidth: borderThickness,
        });
        
        return true;
      }
      return false;
    }

    // Function to wrap text to multiple lines
    function drawWrappedText(text, startX, startY, maxWidth, font, fontSize, color, page) {
      const words = text.split(' ');
      let currentLine = '';
      let currentX = startX;
      let currentLineY = startY;
      const lineHeight = fontSize + 2;

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + (currentLine === '' ? '' : ' ') + words[i];
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth <= maxWidth || currentLine === '') {
          currentLine = testLine;
        } else {
          // Draw current line
          page.drawText(currentLine, {
            x: currentX,
            y: currentLineY,
            size: fontSize,
            font: font,
            color: color,
          });
          
          currentLineY -= lineHeight;
          currentLine = words[i];
        }
      }
      
      // Draw the last line
      if (currentLine !== '') {
        page.drawText(currentLine, {
          x: currentX,
          y: currentLineY,
          size: fontSize,
          font: font,
          color: color,
        });
        currentLineY -= lineHeight;
      }
      
      return currentLineY; // Return the final Y position
    }

    // Draw border on first page
    currentPage.drawRectangle({
      x: margin - 10,
      y: margin - 10,
      width: pageWidth - (margin * 2) + 20,
      height: pageHeight - (margin * 2) + 20,
      borderColor: rgb(0, 0, 0),
      borderWidth: borderThickness,
    });

    // Draw examName
    currentPage.drawText(examName, {
      x: (pageWidth - timesRomanBoldFont.widthOfTextAtSize(examName, 32)) / 2,
      y: currentY - 23,
      size: 32,
      font: timesRomanBoldFont,
      color: rgb(0, 0, 0),
      maxWidth: pageWidth - 2 * margin,
    });
    currentY -= 50;

    // Define table data
    const tableData = [
      [{ title: '', value: `${module}`, width: 0.80 }, { title: 'Note : ', value: '', width: 0.20 }],
      [{ title: 'Ecole : ', value: `${school}`, width: 0.40 }, { title: 'Classe : ', value: `${className}`, width: 0.20 }, { title: 'Année : ', value: `${year}`, width: 0.20 }, { title: `${note} / 20`, value: '', width: 0.20, size: 20, color: rgb(1, 0, 0), merged: true }],
      [{ title: 'Nom : ', value: `${lastName}`, width: 0.30 }, { title: 'Prénom : ', value: `${firstName}`, width: 0.30 }, { title: 'Numéro : ', value: `${number}`, width: 0.20 }],
    ];

    // Draw table data
    tableData.forEach((row) => {
      let currentX = margin;
      row.forEach((cell) => {
        if (cell.merged) {
          const cellWidth = cell.width * (pageWidth - 2 * margin);
          const textWidth = timesRomanBoldFont.widthOfTextAtSize(cell.title, cell.size);
          const textHeight = cell.size;

          currentPage.drawText(cell.title, {
            x: currentX + (cellWidth - textWidth) / 2,
            y: currentY + (cellHeight - textHeight) / 2,
            size: cell.size || 12,
            font: timesRomanBoldFont,
            color: cell.color || rgb(0, 0, 0),
          });
        } else {
          currentPage.drawText(cell.title, {
            x: currentX,
            y: currentY + cellMargin,
            size: 12,
            font: timesRomanBoldFont,
            color: cell.color || rgb(0, 0, 0),
          });

          if (cell.title === '') {
            const colonIndex = cell.value.indexOf(':');

            if (colonIndex !== -1) {
              const boldText = cell.value.substring(0, colonIndex + 1);
              const regularText = cell.value.substring(colonIndex + 1);

              currentPage.drawText(boldText, {
                x: currentX,
                y: currentY + cellMargin,
                size: 12,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              currentPage.drawText(regularText, {
                x: currentX + timesRomanBoldFont.widthOfTextAtSize(boldText, 12),
                y: currentY + cellMargin,
                size: 12,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });
            }
          } else {
            currentPage.drawText(cell.value, {
              x: currentX + cellMargin + 50,
              y: currentY + cellMargin,
              size: 12,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });
          }
        }
        currentX += cell.width * (pageWidth - 2 * margin);
      });
      currentY -= cellHeight;
    });

    // Draw horizontal line
    currentPage.drawLine({
      start: { x: margin - 10, y: currentY + 15 },
      end: { x: pageWidth - margin + 10, y: currentY + 15 },
      thickness: borderThickness,
      color: rgb(0, 0, 0),
      opacity: 1,
    });
    currentY -= 20;

    // Draw bonus points section
    const textSize = 8;
    const circleSize = 5;
    const circleRadius = circleSize / 2;
    const gap = 50;

    const text = '+1 pt pour la rédaction et la propreté de la copie :';
    currentPage.drawText(text, {
      x: margin,
      y: currentY,
      size: textSize,
      font: timesRomanBoldFont,
      color: rgb(0, 0, 0),
    });

    const textWidth = timesRomanBoldFont.widthOfTextAtSize(text, textSize);
    const availableWidth = pageWidth - margin * 2;
    const remainingSpace = availableWidth - textWidth;

    const ouiText = 'Oui';
    const nonText = 'Non';
    const sansCopieText = 'Sans copie';
    const ouiWidth = timesRomanFont.widthOfTextAtSize(ouiText, textSize);
    const nonWidth = timesRomanFont.widthOfTextAtSize(nonText, textSize);
    const sansCopieWidth = timesRomanFont.widthOfTextAtSize(sansCopieText, textSize);
    
    const smallGap = 25; // Smaller gap between options
    const blockWidth = ouiWidth + circleSize + smallGap + nonWidth + circleSize + smallGap + sansCopieWidth + circleSize;

    const blockX = margin + textWidth + (remainingSpace - blockWidth) / 2;

    // Draw "Oui" option
    currentPage.drawText(ouiText, {
      x: blockX,
      y: currentY,
      size: textSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    currentPage.drawCircle({
      x: blockX + ouiWidth + circleRadius + 8,
      y: currentY + circleRadius,
      size: circleSize,
      borderWidth: 1,
      color: rgb(0, 0, 0),
      borderColor: rgb(0, 0, 0),
      opacity: 0,
    });

    // Draw "Non" option
    const nonX = blockX + ouiWidth + circleSize + smallGap;
    currentPage.drawText(nonText, {
      x: nonX,
      y: currentY,
      size: textSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    currentPage.drawCircle({
      x: nonX + nonWidth + circleRadius + 8,
      y: currentY + circleRadius,
      size: circleSize,
      borderWidth: 1,
      color: rgb(0, 0, 0),
      borderColor: rgb(0, 0, 0),
      opacity: 0,
    });

    // Draw "Sans copie" option
    const sansCopieX = nonX + nonWidth + circleSize + smallGap;
    currentPage.drawText(sansCopieText, {
      x: sansCopieX,
      y: currentY,
      size: textSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    currentPage.drawCircle({
      x: sansCopieX + sansCopieWidth + circleRadius + 8,
      y: currentY + circleRadius,
      size: circleSize,
      borderWidth: 1,
      color: rgb(0, 0, 0),
      borderColor: rgb(0, 0, 0),
      opacity: 0,
    });

    currentY -= 30;

    // Draw parties and exercises
    parties.forEach((party, partyIndex) => {
      // Check if we need a new page for party header
      checkPageBreak(30);

      // Draw party name
      currentPage.drawText(`${party.name} :`, {
        x: margin,
        y: currentY,
        size: 10,
        font: timesRomanBoldFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 15;

      party.exercises.forEach(async (exercise, exerciseIndex) => {
        if (exercise.type === 'QCM') {
          const studentScore = studentQCM.computedScore;
          const totalPoints = exercise.data.points || exercise.points;
          
          // Calculate required space
          const questionsCount = exercise.data.questions.length;
          const requiredSpace = 30 + (questionsCount * 60); // Estimate space needed
          checkPageBreak(requiredSpace);

          // Draw QCM title with student score
          currentPage.drawText(`${exerciseIndex + 1}- Choisir la bonne réponse : `, {
            x: margin,
            y: currentY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          currentPage.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Choisir la bonne réponse : `, 8),
            y: currentY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });
          currentY -= 15;

          exercise.data.questions.forEach((q, questionIndex) => {
            const columnX = margin + (questionIndex % 2) * (columnWidth + columnGap) + 5;
            const columnY = currentY - Math.floor(questionIndex / 2) * 50;

            // Check if we need space for this question
            if (columnY < margin + 60) {
              checkPageBreak(100);
              currentY = pageHeight - margin - 20;
            }

            const actualY = currentY - Math.floor(questionIndex / 2) * 50;

            // Display the question
            currentPage.drawText(`${q.question}`, {
              x: columnX,
              y: actualY,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });

            // Display answers
            q.answers.forEach((answer, index) => {
              const answerY = actualY - (index + 1) * 10;
              const userAnswer = studentQCM.userResponses[`${partyIndex}-${q.id}`];
              const isUserAnswer = index === userAnswer;
              const answerColor = isUserAnswer ? (index === q.correctAnswer ? rgb(0, 1, 0) : rgb(1, 0, 0)) : rgb(0, 0, 0);

              currentPage.drawText(`• ${answer}`, {
                x: columnX + 10,
                y: answerY,
                size: 8,
                font: timesRomanFont,
                color: answerColor,
              });
            });
          });

          currentY -= Math.ceil(exercise.data.questions.length / 2) * 50 + 20;

        } else if (exercise.type === 'CLD') {
          const studentScore = studentCLD.computedScore;
          const totalPoints = exercise.data.points;
          
          checkPageBreak(250); // CLD needs more space

          // Draw CLD title with student score
          currentPage.drawText(`${exerciseIndex + 1}- Compléter le dessin : `, {
            x: margin,
            y: currentY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          currentPage.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Compléter le dessin : `, 8),
            y: currentY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });
          currentY -= 15;

          // Display the shuffled responses under the question
          const shuffledResponses = exercise.data.shuffledResponses.join(' - ');
          
          const maxWidth = pageWidth - 2 * margin;
          const centerX = (pageWidth - Math.min(timesRomanFont.widthOfTextAtSize(shuffledResponses, 8), maxWidth)) / 2;
          
          currentY = drawWrappedText(shuffledResponses, centerX, currentY, maxWidth, timesRomanFont, 8, rgb(0, 0, 0), currentPage);
          currentY -= 10;

          // Display answers
          studentCLD.formattedResponses.forEach((answer, index) => {
            const isAnswer = answer !== '';
            const isCorrect = answer === exercise.data.responses[index];
            const answerColor = isAnswer ? (isCorrect ? rgb(0, 1, 0) : rgb(1, 0, 0)) : rgb(0, 0, 0);

            currentPage.drawText(`${index + 1}. ${answer}`, {
              x: margin + 10,
              y: currentY,
              size: 8,
              font: timesRomanFont,
              color: answerColor,
            });
            currentY -= 12;
          });

          // Load and display the image from URL
          const imageUrl = exercise.data.image;
          
          try {
            console.log(`Attempting to fetch image from URL: ${imageUrl}`);
            
            // Fetch image from URL
            const https = require('https');
            const http = require('http');
            
            const fetchImage = (url) => {
              return new Promise((resolve, reject) => {
                const client = url.startsWith('https://') ? https : http;
                console.log(`Using ${url.startsWith('https://') ? 'HTTPS' : 'HTTP'} client`);
                
                client.get(url, (response) => {
                  console.log(`HTTP Response Status: ${response.statusCode}`);
                  console.log(`Content-Type: ${response.headers['content-type']}`);
                  
                  if (response.statusCode !== 200) {
                    reject(new Error(`Failed to fetch image: ${response.statusCode}`));
                    return;
                  }
                  
                  const chunks = [];
                  response.on('data', (chunk) => {
                    chunks.push(chunk);
                    console.log(`Received chunk of size: ${chunk.length}`);
                  });
                  
                  response.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    console.log(`Total image data received: ${buffer.length} bytes`);
                    resolve(buffer);
                  });
                }).on('error', (error) => {
                  console.error('Network error:', error);
                  reject(error);
                });
              });
            };
            
            const imageBytes = await fetchImage(imageUrl);
            console.log(`Successfully fetched image, size: ${imageBytes.length} bytes`);
            
            let embeddedImage;
            
            // Detect image format from URL or content
            const urlLower = imageUrl.toLowerCase();
            console.log(`Analyzing URL for format: ${urlLower}`);
            
            try {
              if (urlLower.includes('.png') || urlLower.includes('png')) {
                console.log('Attempting to embed as PNG...');
                embeddedImage = await pdfDoc.embedPng(imageBytes);
                console.log('Successfully embedded PNG image');
              } else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || urlLower.includes('jpg') || urlLower.includes('jpeg')) {
                console.log('Attempting to embed as JPEG...');
                embeddedImage = await pdfDoc.embedJpg(imageBytes);
                console.log('Successfully embedded JPEG image');
              } else {
                console.log('Format unclear from URL, trying PNG first...');
                try {
                  embeddedImage = await pdfDoc.embedPng(imageBytes);
                  console.log('Successfully embedded as PNG (fallback)');
                } catch (pngError) {
                  console.log('PNG failed, trying JPEG...', pngError.message);
                  embeddedImage = await pdfDoc.embedJpg(imageBytes);
                  console.log('Successfully embedded as JPEG (fallback)');
                }
              }
            } catch (embedError) {
              console.error('Failed to embed image:', embedError.message);
              throw embedError;
            }
            
            console.log(`Image dimensions: ${embeddedImage.width} x ${embeddedImage.height}`);
            
            // Calculate scaled dimensions to fit within available space
            const maxImageWidth = 150;
            const maxImageHeight = 120;
            const imageAspectRatio = embeddedImage.width / embeddedImage.height;
            
            let scaledWidth, scaledHeight;
            
            if (imageAspectRatio > 1) {
              // Landscape image
              scaledWidth = Math.min(maxImageWidth, embeddedImage.width);
              scaledHeight = scaledWidth / imageAspectRatio;
            } else {
              // Portrait or square image
              scaledHeight = Math.min(maxImageHeight, embeddedImage.height);
              scaledWidth = scaledHeight * imageAspectRatio;
            }
            
            console.log(`Scaled dimensions: ${scaledWidth} x ${scaledHeight}`);
            
            // Position the image on the right side, but away from table area
            const imageX = pageWidth - margin - scaledWidth - 50;
            let imageY = currentY;
            
            // If image would be too high, position it below the table
            if (imageY + scaledHeight > pageHeight - margin - 50) {
              imageY = currentY - scaledHeight - 20; // Position below current content
            }
            
            console.log(`Image position: x=${imageX}, y=${imageY}, currentY=${currentY}`);
            
            // Check if image fits on current page
            if (imageY < margin + 50) {
              console.log('Image needs new page, creating page break...');
              checkPageBreak(scaledHeight + 50);
              // Recalculate Y position after potential page break
              imageY = currentY - scaledHeight - 20;
              console.log(`New image position after page break: y=${imageY}`);
              
              currentPage.drawImage(embeddedImage, {
                x: imageX,
                y: imageY,
                width: scaledWidth,
                height: scaledHeight,
              });
              console.log('Image drawn on new page');
              
              // Draw a simple border around the image for visibility
              currentPage.drawRectangle({
                x: imageX - 2,
                y: imageY - 2,
                width: scaledWidth + 4,
                height: scaledHeight + 4,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
              });
            } else {
              currentPage.drawImage(embeddedImage, {
                x: imageX,
                y: imageY,
                width: scaledWidth,
                height: scaledHeight,
              });
              console.log('Image drawn on current page');
              
              // Draw a simple border around the image for visibility
              currentPage.drawRectangle({
                x: imageX - 2,
                y: imageY - 2,
                width: scaledWidth + 4,
                height: scaledHeight + 4,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
              });
            }
            
          } catch (error) {
            console.error(`Error loading image from URL ${imageUrl}:`, error.message);
            console.error('Full error:', error);
            // Continue without image if there's an error
          }
          currentY -= 20;

        } else if (exercise.type === 'CLT') {
          const studentScore = studentCLT.computedScore;
          const totalPoints = exercise.data.points;
          
          checkPageBreak(120);

          // Draw CLT title with student score
          currentPage.drawText(`${exerciseIndex + 1}- Compléter le tableau avec les mots appropriés : `, {
            x: margin,
            y: currentY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          currentPage.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Compléter le tableau avec les mots appropriés : `, 8),
            y: currentY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });
          currentY -= 15;

          // Display the shuffled words
          const shuffledWords = exercise.data.shuffledWords.join(' - ');
          
          const maxWidth = pageWidth - 2 * margin;
          const centerX = (pageWidth - Math.min(timesRomanFont.widthOfTextAtSize(shuffledWords, 8), maxWidth)) / 2;
          
          currentY = drawWrappedText(shuffledWords, centerX, currentY, maxWidth, timesRomanFont, 8, rgb(0, 0, 0), currentPage);
          currentY -= 15;

          // Create the table
          const columnNames = exercise.data.columnNames;
          const numColumns = columnNames.length;
          const tableWidth = pageWidth - 2 * margin;
          const cellWidth = tableWidth / numColumns;

          // Draw column headers
          let currentX = margin;
          columnNames.forEach((columnName) => {
            currentPage.drawText(columnName, {
              x: currentX + (cellWidth - timesRomanFont.widthOfTextAtSize(columnName, 8)) / 2,
              y: currentY + 7,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });

            currentPage.drawRectangle({
              x: currentX,
              y: currentY,
              width: cellWidth,
              height: 15,
              borderColor: rgb(0, 0, 0),
              borderWidth: 2,
            });

            currentX += cellWidth;
          });
          currentY -= 45;

          // Draw table content with proper word-level text wrapping within cells
          currentX = margin;
          let maxCellHeight = 150;
          currentY -= maxCellHeight;
          
          console.log(`Drawing CLT table with ${columnNames.length} columns`);
          
          const cellContents = [];
          
          // First pass: calculate content and required heights for all cells
          columnNames.forEach((header, headerIndex) => {
            const correctWords = exercise.data.correctAnswers[header] || [];
            const studentWords = studentCLT.formattedWords[header] || [];
            
            console.log(`Processing column "${header}" with ${studentWords.length} words:`, studentWords);
            
            // Process each student word/phrase separately
            const allLines = [];
            
            studentWords.forEach((phrase, phraseIndex) => {
              const isCorrect = correctWords.includes(phrase);
              const phraseColor = isCorrect ? rgb(0, 1, 0) : rgb(1, 0, 0);
              
              // Break phrase into individual words for wrapping
              const words = phrase.split(' ');
              const maxCellWidth = cellWidth - 10; // 10px padding
              
              let currentLine = [];
              let currentLineWidth = 0;
              
              words.forEach((word, wordIndex) => {
                const wordWidth = timesRomanFont.widthOfTextAtSize(word + ' ', 8);
                
                // Check if adding this word would exceed the line width
                if (currentLineWidth + wordWidth > maxCellWidth && currentLine.length > 0) {
                  // Complete current line
                  allLines.push({
                    segments: [...currentLine],
                    width: currentLineWidth
                  });
                  
                  // Start new line with current word
                  currentLine = [{
                    text: word,
                    color: phraseColor,
                    width: timesRomanFont.widthOfTextAtSize(word, 8)
                  }];
                  currentLineWidth = timesRomanFont.widthOfTextAtSize(word, 8);
                } else {
                  // Add word to current line
                  currentLine.push({
                    text: word,
                    color: phraseColor,
                    width: timesRomanFont.widthOfTextAtSize(word, 8)
                  });
                  currentLineWidth += wordWidth;
                }
                
                // Add space if not the last word in the phrase
                if (wordIndex < words.length - 1) {
                  currentLine.push({
                    text: ' ',
                    color: phraseColor,
                    width: timesRomanFont.widthOfTextAtSize(' ', 8)
                  });
                }
              });
              
              // Add remaining line if it has content
              if (currentLine.length > 0) {
                allLines.push({
                  segments: [...currentLine],
                  width: currentLineWidth
                });
              }
              
              // Add separator line if not the last phrase
              if (phraseIndex < studentWords.length - 1) {
                allLines.push({
                  segments: [{
                    text: ' - ',
                    color: rgb(0, 0, 0),
                    width: timesRomanFont.widthOfTextAtSize(' - ', 8)
                  }],
                  width: timesRomanFont.widthOfTextAtSize(' - ', 8)
                });
              }
            });
            
            console.log(`Column "${header}" will have ${allLines.length} lines`);
            
            // Calculate required height
            const lineHeight = 12;
            const paddingTop = 8;
            const paddingBottom = 8;
            const requiredHeight = Math.max(30, allLines.length * lineHeight + paddingTop + paddingBottom);
            
            maxCellHeight = Math.max(maxCellHeight, requiredHeight);
            console.log(`Required height for column "${header}": ${requiredHeight}px`);
            
            cellContents.push({
              lines: allLines,
              requiredHeight,
              header
            });
          });
          
          console.log(`Final table row height: ${maxCellHeight}px`);
          
          // Second pass: draw all cells with uniform height
          currentX = margin;
          cellContents.forEach((cellContent, cellIndex) => {
            const header = cellContent.header;
            console.log(`Drawing cell ${cellIndex} for column "${header}"`);
            
            const cellStartX = currentX;
            const cellStartY = currentY;
            
            // Calculate text starting position
            const paddingLeft = 5;
            const paddingTop = 8;
            let textY = cellStartY + maxCellHeight - paddingTop;
            const lineHeight = 12;
            
            // Draw each line of wrapped text
            cellContent.lines.forEach((line, lineIndex) => {
              let lineX = cellStartX + paddingLeft;
              console.log(`Drawing line ${lineIndex} at y=${textY}`);
              
              line.segments.forEach((segment, segmentIndex) => {
                const maxTextX = cellStartX + cellWidth - 5; // 5px right padding
                
                if (lineX + segment.width <= maxTextX) {
                  currentPage.drawText(segment.text, {
                    x: lineX,
                    y: textY,
                    size: 8,
                    font: timesRomanFont,
                    color: segment.color,
                  });
                  
                  lineX += segment.width;
                  console.log(`Drew segment "${segment.text}" at x=${lineX - segment.width}`);
                } else {
                  console.log(`Segment "${segment.text}" would exceed cell boundary, truncating or skipping`);
                }
              });
              
              textY -= lineHeight;
            });

            // Draw cell border
            currentPage.drawRectangle({
              x: cellStartX,
              y: cellStartY,
              width: cellWidth,
              height: maxCellHeight,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });

            console.log(`Drew cell border: x=${cellStartX}, y=${cellStartY}, w=${cellWidth}, h=${maxCellHeight}`);
            currentX += cellWidth;
          });
          
          currentY -= maxCellHeight + 10;
          console.log(`Table completed, currentY now: ${currentY}`);

        } else if (exercise.type === 'RPF') {
          const studentScore = studentRPF.computedScore;
          const totalPoints = exercise.data.points;
          const { textLeft, textRight, correctAnswers } = exercise.data;
          const { studentAnswers } = studentRPF;
          
          const itemsCount = textLeft.length;
          const requiredSpace = 50 + (itemsCount * 12);
          checkPageBreak(requiredSpace);

          // Draw RPF title with student score
          currentPage.drawText(`${exerciseIndex + 1}- Relier par une flèche : `, {
            x: margin,
            y: currentY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          currentPage.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Relier par une flèche : `, 8),
            y: currentY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });
          currentY -= 15;

          const contentWidth = pageWidth * 0.7;
          const leftRightWidth = contentWidth / 2;
          const centerX = (pageWidth - contentWidth) / 2;
          const leftX = centerX;
          const rightX = centerX + leftRightWidth;

          const leftCoords = [];
          const rightCoords = [];

          textLeft.forEach((leftText, index) => {
            const leftTextWidth = timesRomanFont.widthOfTextAtSize(`${leftText} •`, 8);

            currentPage.drawText(`${leftText} •`, {
              x: leftX + 30 - leftTextWidth,
              y: currentY,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });

            leftCoords.push({ x: leftX + 30 - 5, y: currentY - 2 });

            const rightText = textRight[index];
            currentPage.drawText(`• ${rightText}`, {
              x: rightX,
              y: currentY,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });

            rightCoords.push({ x: rightX + 5, y: currentY - 2 });

            currentY -= 12;
          });

          // Draw connection lines
          Object.entries(studentAnswers).forEach(([leftTerm, rightTerm]) => {
            const leftIndex = textLeft.indexOf(leftTerm);
            const rightIndex = textRight.indexOf(rightTerm);

            if (leftIndex !== -1 && rightIndex !== -1) {
              const leftCoord = leftCoords[leftIndex];
              const rightCoord = rightCoords[rightIndex];
              const lineColor = correctAnswers[leftTerm] === rightTerm ? rgb(0, 1, 0) : rgb(1, 0, 0);

              currentPage.drawLine({
                start: { x: leftCoord.x + 5, y: leftCoord.y + 5 },
                end: { x: rightCoord.x - 5, y: rightCoord.y + 5 },
                thickness: 1,
                color: lineColor,
              });
            }
          });
          currentY -= 20;

        } else if (exercise.type === 'RLV') {
          const studentScore = studentRLV.computedScore;
          const totalPoints = exercise.data.points;
          
          const phrasesCount = exercise.data.phrases.length;
          const requiredSpace = 50 + (phrasesCount * 15);
          checkPageBreak(requiredSpace);

          // Draw RLV title with student score
          currentPage.drawText(`${exerciseIndex + 1}- Remplir convenablement le vide avec les mots suivants :`, {
            x: margin,
            y: currentY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          currentPage.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Remplir convenablement le vide avec les mots suivants : `, 8),
            y: currentY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });
          currentY -= 15;

          // Display the shuffled words
          const shuffledWordsText = exercise.data.shuffledWords.join(' - ');
          
          const maxWidth = pageWidth - 2 * margin;
          const centerX = (pageWidth - Math.min(timesRomanFont.widthOfTextAtSize(shuffledWordsText, 8), maxWidth)) / 2;
          
          currentY = drawWrappedText(shuffledWordsText, centerX, currentY, maxWidth, timesRomanFont, 8, rgb(0, 0, 0), currentPage);
          currentY -= 10;

          // Process phrases
          exercise.data.phrases.forEach((phrase, phraseIndex) => {
            const splitPhrase = phrase.split(' ');
            let phraseX = margin;
            
            const label = String.fromCharCode(97 + phraseIndex) + ') ';
            currentPage.drawText(label, {
              x: phraseX,
              y: currentY,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });
            phraseX += timesRomanFont.widthOfTextAtSize(label, 8);

            let answerColors = [];
            splitPhrase.forEach((word, wordIndex) => {
              let answerColor = rgb(0, 0, 0);
              
              if (word === '.................') {
                const answerEntry = studentRLV.studentAnswers.find(
                  entry => entry.phraseIndex === phraseIndex && entry.wordIndex === wordIndex
                );
                const studentAnswer = (answerEntry && answerEntry.answer !== '') ? answerEntry.answer : '.................';
                
                studentRLV.studentAnswers.forEach(({ phraseIndex, wordIndex, answer }, index) => {
                  if (answerColors.length < studentRLV.studentAnswers.length) {
                    if (answer !== '') {
                      if (answer === exercise.data.correctAnswers[index]) {
                        answerColor = rgb(0, 1, 0);
                        answerColors = [...answerColors, { wordIndex, answerColor }];
                      } else {
                        answerColor = rgb(1, 0, 0);
                        answerColors = [...answerColors, { wordIndex, answerColor }];
                      }
                    }
                  }
                });
                
                const colorObj = answerColors.find(a => a.wordIndex === wordIndex);
                const color = colorObj ? colorObj.answerColor : rgb(0, 0, 0);

                currentPage.drawText(`${studentAnswer} `, {
                  x: phraseX,
                  y: currentY,
                  size: 8,
                  font: timesRomanFont,
                  color: color,
                });

                phraseX += timesRomanFont.widthOfTextAtSize(`${studentAnswer} `, 8);
              } else {
                currentPage.drawText(`${word} `, {
                  x: phraseX,
                  y: currentY,
                  size: 8,
                  font: timesRomanFont,
                  color: rgb(0, 0, 0),
                });
                phraseX += timesRomanFont.widthOfTextAtSize(`${word} `, 8);
              }
            });
            currentY -= 15;
          });

        } else if (exercise.type === 'RLE') {
          const studentScore = studentRLE.computedScore;
          const totalPoints = exercise.data.points;
          
          const linesCount = exercise.data.text.split('\n').length;
          const requiredSpace = 50 + (linesCount * 18);
          checkPageBreak(requiredSpace);

          // Draw RLE title with student score
          currentPage.drawText(`${exerciseIndex + 1}- Remplir les entrées avec vos réponses :`, {
            x: margin,
            y: currentY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          currentPage.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Remplir les entrées avec vos réponses : `, 8),
            y: currentY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });
          currentY -= 20;

          exercise.data.text.split('\n').map((line, lineIndex) => {
            let phraseX = margin;
            
            const label = String.fromCharCode(97 + lineIndex) + ') ';
            currentPage.drawText(label, {
              x: phraseX,
              y: currentY,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });
            phraseX += timesRomanFont.widthOfTextAtSize(label, 8);

            line.split(/(\{.*?\})/g).map((part) => {
              if (part.match(/^\{.*?\}$/)) {
                let answerColor = rgb(0, 0, 0);
                
                if (studentRLE.studentAnswers[lineIndex] !== '') {
                  if (studentRLE.studentAnswers[lineIndex] === exercise.data.correctAnswers[lineIndex]) {
                    answerColor = rgb(0, 1, 0);
                  } else {
                    answerColor = rgb(1, 0, 0);
                  }

                  currentPage.drawText(`${studentRLE.studentAnswers[lineIndex]}`, {
                    x: phraseX,
                    y: currentY,
                    size: 8,
                    font: customFont,
                    color: answerColor,
                  });
                  phraseX += customFont.widthOfTextAtSize(`${studentRLE.studentAnswers[lineIndex]}`, 8);
                } else {
                  currentPage.drawText('.................', {
                    x: phraseX,
                    y: currentY,
                    size: 8,
                    font: customFont,
                    color: answerColor,
                  });
                  phraseX += customFont.widthOfTextAtSize('.................', 8);
                }
              } else {
                currentPage.drawText(`${part}`, {
                  x: phraseX,
                  y: currentY,
                  size: 8,
                  font: customFont,
                  color: rgb(0, 0, 0),
                });
                phraseX += customFont.widthOfTextAtSize(`${part}`, 8);
              }
            });
            currentY -= 18;
          });

        } else if (exercise.type === 'OLE') {
          const studentScore = studentOLE.computedScore;
          const totalPoints = exercise.data.points;
          
          // Calculate required space based on questions and steps
          let totalSteps = 0;
          exercise.data.questions.forEach(q => totalSteps += q.steps.length);
          const requiredSpace = 50 + (exercise.data.questions.length * 15) + (totalSteps * 12);
          checkPageBreak(requiredSpace);

          // Draw OLE title with student score
          currentPage.drawText(`${exerciseIndex + 1}- Ordonner les étapes pour répondre correctement aux questions :`, {
            x: margin,
            y: currentY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          const titleWidth = timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Ordonner les étapes pour répondre correctement aux questions :`, 8);
          currentPage.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + titleWidth + 5,
            y: currentY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });
          currentY -= 15;

          // Process questions
          exercise.data.questions.forEach((question, questionIndex) => {
            const studentAnswer = studentOLE.studentAnswers.find(ans => ans.id === question.id);

            // Draw the question
            currentPage.drawText(`${String.fromCharCode(97 + questionIndex)}) ${question.question} : `, {
              x: margin,
              y: currentY,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });

            currentPage.drawText(`(${studentAnswer.questionScore} / ${question.points} pts)`, {
              x: margin + timesRomanFont.widthOfTextAtSize(`${String.fromCharCode(97 + questionIndex)}) ${question.question} : `, 8),
              y: currentY,
              size: 8,
              font: timesRomanBoldFont,
              color: rgb(1, 0, 0),
            });
            currentY -= 12;

            // Process steps
            studentAnswer.shuffledSteps.forEach((step, stepIndex) => {
              const correctStep = question.steps[stepIndex];
              const stepColor = step === correctStep ? rgb(0, 1, 0) : rgb(1, 0, 0);

              currentPage.drawText(`é${stepIndex + 1}: `, {
                x: margin + 15,
                y: currentY,
                size: 8,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              currentPage.drawText(`${step}`, {
                x: margin + 15 + timesRomanBoldFont.widthOfTextAtSize(`é${stepIndex + 1}: `, 8),
                y: currentY,
                size: 8,
                font: customFont,
                color: stepColor,
              });

              currentY -= 12;
            });

            currentY -= 5; // Extra spacing between questions
          });
        }

        // Add spacing after each exercise
        currentY -= 15;
      });

      // Add spacing between parties (but not after the last one)
      if (partyIndex < parties.length - 1) {
        currentY -= 20;
      }
    });

    // Save PDF to Google Cloud Storage
    const pdfFileName = `${number}- ${lastName} ${firstName}.pdf`;
    const pdfFilePath = `${niveau}/${examName}/${school}/${className}/${pdfFileName}`;
    const pdfBytes = await pdfDoc.save();

    // Upload the PDF to GCS
    const publicUrl = await uploadPDFToGCS(pdfBytes, pdfFilePath);

    console.log('PDF created and uploaded successfully.');

    return publicUrl;

  } catch (error) {
    console.error('Error creating PDF:', error);
  }
}

module.exports = { createPDF };
