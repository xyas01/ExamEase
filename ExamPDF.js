const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

async function createPDF({ examName, module, note, school, className, year, lastName, firstName, number, parties, studentQCM, studentCLD, studentCLT, studentRPF, studentRLV, studentRLE, studentOLE }) {
  try {
    const pdfDoc = await PDFDocument.create();
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Register fontkit to use custom fonts
    pdfDoc.registerFontkit(fontkit);
    const customFontBytes = fs.readFileSync(path.join(__dirname, 'fonts', 'DoulosSILCompact-R.ttf'));
    const customFont = await pdfDoc.embedFont(customFontBytes);


    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const margin = 36;
    const cellHeight = 20;
    const cellMargin = 5;
    const borderThickness = 4;
    const columnGap = 20;
    const columnWidth = (width - 2 * margin - columnGap) / 2;

    // Draw border
    page.drawRectangle({
      x: margin - 10,
      y: margin - 10,
      width: width - (margin * 2) + 20,
      height: height - (margin * 2) + 20,
      borderColor: rgb(0, 0, 0),
      borderWidth: borderThickness,
    });

    // Draw examName
    page.drawText(examName, {
      x: (width - timesRomanBoldFont.widthOfTextAtSize(examName, 32)) / 2,
      y: height - margin - 23,
      size: 32,
      font: timesRomanBoldFont,
      color: rgb(0, 0, 0),
      maxWidth: width - 2 * margin,
    });

    // Define table data
    const tableData = [
      [{ title: '', value: `${module}`, width: 0.80 }, { title: 'Note : ', value: '', width: 0.20 }],
      [{ title: 'Ecole : ', value: `${school}`, width: 0.40 }, { title: 'Classe : ', value: `${className}`, width: 0.20 }, { title: 'Année : ', value: `${year}`, width: 0.20 }, { title: `${note} / 20`, value: '', width: 0.20, size: 20, color: rgb(1, 0, 0), merged: true }],
      [{ title: 'Nom : ', value: `${lastName}`, width: 0.30 }, { title: 'Prénom : ', value: `${firstName}`, width: 0.30 }, { title: 'Numéro : ', value: `${number}`, width: 0.20 }],
    ];

    // Draw table data
    let currentY = height - margin - cellHeight - 35;
    tableData.forEach((row) => {
      let currentX = margin;
      row.forEach((cell) => {
        if (cell.merged) {
          const cellWidth = cell.width * (width - 2 * margin);
          const textWidth = timesRomanBoldFont.widthOfTextAtSize(cell.title, cell.size);
          const textHeight = cell.size;

          page.drawText(cell.title, {
            x: currentX + (cellWidth - textWidth) / 2,
            y: currentY + (cellHeight - textHeight) / 2,
            size: cell.size || 12,
            font: timesRomanBoldFont,
            color: cell.color || rgb(0, 0, 0),
          });
        } else {
          page.drawText(cell.title, {
            x: currentX,
            y: currentY + cellMargin,
            size: 12,
            font: timesRomanBoldFont,
            color: cell.color || rgb(0, 0, 0),
          });

          if (cell.title === '') {
            const colonIndex = cell.value.indexOf(':');

            // If ':' is found, split the text
            if (colonIndex !== -1) {
              const boldText = cell.value.substring(0, colonIndex + 1); // Include the ':' in the bold part
              const regularText = cell.value.substring(colonIndex + 1);

              // Draw bold part
              page.drawText(boldText, {
                x: currentX,
                y: currentY + cellMargin,
                size: 12,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              // Draw regular part
              page.drawText(regularText, {
                x: currentX + timesRomanBoldFont.widthOfTextAtSize(boldText, 12),
                y: currentY + cellMargin,
                size: 12,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });
            }

          } else {
            page.drawText(cell.value, {
              x: currentX + cellMargin + 50,
              y: currentY + cellMargin,
              size: 12,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });
          }

        }

        currentX += cell.width * (width - 2 * margin);
      });
      currentY -= cellHeight;
    });

    page.drawLine({
      start: { x: margin - 10, y: currentY + 15 },
      end: { x: width - margin + 10, y: currentY + 15 },
      thickness: borderThickness,
      color: rgb(0, 0, 0),
      opacity: 1,
    })

    const textSize = 8; // Font size for text
    const circleSize = 5; // Circle size for "Oui" and "Non"
    const circleRadius = circleSize / 2;
    const gap = 50; // Gap between "Oui" and "Non"

    currentY -= 5;

    // Step 1: Draw the text first
    const text = '+1 pt pour la rédaction et la propreté de la copie :';
    page.drawText(text, {
      x: margin,
      y: currentY,
      size: textSize,
      font: timesRomanBoldFont,
      color: rgb(0, 0, 0),
    });

    // Step 2: Calculate the width of the text and remaining space for centering the block
    const textWidth = timesRomanBoldFont.widthOfTextAtSize(text, textSize);
    const availableWidth = width - margin * 2; // Total available width between margins
    const remainingSpace = availableWidth - textWidth; // Remaining space after the text

    // Step 3: Calculate the width of the "Oui ○" and "Non ○" block
    const ouiText = 'Oui';
    const nonText = 'Non';
    const ouiWidth = timesRomanFont.widthOfTextAtSize(ouiText, textSize);
    const nonWidth = timesRomanFont.widthOfTextAtSize(nonText, textSize);
    const blockWidth = ouiWidth + circleSize + gap + nonWidth + circleSize; // Total block width for "Oui ○ Non ○"

    // Step 4: Center the block in the remaining space
    const blockX = margin + textWidth + (remainingSpace - blockWidth) / 2; // X position for the block

    // Step 5: Draw "Oui" and its circle
    page.drawText(ouiText, {
      x: blockX,
      y: currentY,
      size: textSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    page.drawCircle({
      x: blockX + ouiWidth + circleRadius + 10, // Position the circle next to "Oui"
      y: currentY + circleRadius, // Center the circle vertically with the text
      size: circleSize,
      borderWidth: 1,
      color: rgb(0, 0, 0), // Circle border color
      borderColor: rgb(0, 0, 0), // Border only, no fill
      opacity: 0, // Make sure the circle has no fill
    });

    // Step 6: Draw "Non" and its circle with the specified gap
    const nonX = blockX + ouiWidth + circleSize + gap;
    page.drawText(nonText, {
      x: nonX,
      y: currentY,
      size: textSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    page.drawCircle({
      x: nonX + nonWidth + circleRadius + 10, // Position the circle next to "Non"
      y: currentY + circleRadius, // Center the circle vertically with the text
      size: circleSize,
      borderWidth: 1,
      color: rgb(0, 0, 0), // Circle border color
      borderColor: rgb(0, 0, 0), // Border only, no fill
      opacity: 0, // Make sure the circle has no fill
    });

    currentY -= 15
    // Draw parties and exercises
    parties.forEach((party, partyIndex) => {
      if (partyIndex === parties.length - 1) {
        currentY += 180
      }
      let partStartY = currentY; // Increase space between party name and exercise question

      // Draw party name
      page.drawText(`${party.name} :`, {
        x: margin,
        y: partStartY,
        size: 10,
        font: timesRomanBoldFont,
        color: rgb(0, 0, 0),
      });

      partStartY -= 10;

      party.exercises.forEach(async (exercise, exerciseIndex) => {
        let exerciseY = partStartY;

        if (exercise.type === 'QCM') {
          const studentScore = studentQCM.computedScore;
          const totalPoints = exercise.data.points || exercise.points;

          // Draw QCM title with student score
          page.drawText(`${exerciseIndex + 1}- Choisir la bonne réponse : `, {
            x: margin,
            y: exerciseY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          page.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Choisir la bonne réponse : `, 8),
            y: exerciseY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });

          // Adjust Y position for questions and answers
          exerciseY -= 10;
          exercise.data.questions.forEach((q, questionIndex) => {
            const columnX = margin + (questionIndex % 2) * (columnWidth + columnGap) + 5;
            const columnY = exerciseY - Math.floor(questionIndex / 2) * (2 * cellHeight);

            // Display the question
            page.drawText(`${q.question}`, {
              x: columnX,
              y: columnY,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });

            // Adjust answer position
            q.answers.forEach((answer, index) => {
              const answerY = columnY - (index + 1) * (cellHeight / 2) + 5;
              const userAnswer = studentQCM.userResponses[`${partyIndex}-${q.id}`];
              const isUserAnswer = index === userAnswer;
              const answerColor = isUserAnswer ? (index === q.correctAnswer ? rgb(0, 1, 0) : rgb(1, 0, 0)) : rgb(0, 0, 0);

              page.drawText(`• ${answer}`, {
                x: columnX + 10,
                y: answerY - 5,
                size: 8,
                font: timesRomanFont,
                color: answerColor,
              });
            });
          });

          // Adjust Y position for the next exercise
          exerciseY -= (exercise.data.questions.length * 3 + 5) * cellHeight;
        } else if (exercise.type === 'CLD') {
          const studentScore = studentCLD.computedScore;
          const totalPoints = exercise.data.points;

          // Draw CLD title with student score
          page.drawText(`${exerciseIndex + 1}- Compléter le dessin : `, {
            x: margin,
            y: exerciseY - 92,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          page.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Compléter le dessin : `, 8),
            y: exerciseY - 92,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });

          // Display the shuffled responses under the question
          const shuffledResponses = exercise.data.shuffledResponses.join(' - ');
          exerciseY -= 10;
          page.drawText(shuffledResponses, {
            x: (width - timesRomanFont.widthOfTextAtSize(shuffledResponses, 10)) / 2,
            y: exerciseY - 92,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          // Adjust Y position for answers
          exerciseY -= 10;
          studentCLD.formattedResponses.forEach((answer, index) => {
            const answerY = exerciseY - index * (cellHeight / 2) - 92;
            const isAnswer = answer !== '';
            const isCorrect = answer === exercise.data.responses[index];
            const answerColor = isAnswer ? (isCorrect ? rgb(0, 1, 0) : rgb(1, 0, 0)) : rgb(0, 0, 0);

            // Display the answer with color
            page.drawText(`${index + 1}. ${answer}`, {
              x: margin + 10,
              y: answerY - 5,
              size: 8,
              font: timesRomanFont,
              color: answerColor,
            });
          });

          // Load and display the image representing "le dessin"
          const imageFileName = exercise.data.image.split('/').pop(); // Extract the image file name
          const imagePath = path.join(__dirname, 'assets', imageFileName);
          if (fs.existsSync(imagePath)) {
            const imageBytes = fs.readFileSync(imagePath);
            const embeddedImage = await pdfDoc.embedPng(imageBytes);
            const scaledImage = embeddedImage.scale(0.2);

            page.drawImage(embeddedImage, {
              x: width - margin - scaledImage.width - 10,
              y: exerciseY - 182, // Adjust Y position for the image
              width: scaledImage.width,
              height: scaledImage.height,
            });

            // Image border
            page.drawRectangle({
              x: width - margin - scaledImage.width - 11,
              y: exerciseY - 183,
              width: scaledImage.width + 1,
              height: scaledImage.height + 1,
              borderColor: rgb(0, 0, 0),
              borderWidth: 2,
            });
          }


          // Adjust Y position for the next exercise
          exerciseY -= 10;
        } else if (exercise.type === 'CLT') {
          const studentScore = studentCLT.computedScore;
          const totalPoints = exercise.data.points;

          // Draw CLT title with student score
          page.drawText(`${exerciseIndex + 1}- Compléter le tableau avec les mots appropriés : `, {
            x: margin,
            y: exerciseY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          page.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Compléter le tableau avec les mots appropriés : `, 8),
            y: exerciseY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });

          // Display the shuffled responses under the question
          const shuffledWords = exercise.data.shuffledWords.join(' - ');
          exerciseY -= 10;
          page.drawText(shuffledWords, {
            x: (width - timesRomanFont.widthOfTextAtSize(shuffledWords, 8)) / 2,
            y: exerciseY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          // Create the table for column names and formatted words
          const columnNames = exercise.data.columnNames;
          const numColumns = columnNames.length;
          const tableWidth = width - 2 * margin;
          const cellWidth = tableWidth / numColumns;

          exerciseY -= 25; // Adjust Y position for the table

          // Draw the first row (columnNames)
          let currentX = margin;
          columnNames.forEach((columnName) => {
            page.drawText(columnName, {
              x: currentX + (cellWidth - timesRomanFont.widthOfTextAtSize(columnName, 10)) / 2,
              y: exerciseY + (15 / 2),
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });

            // Draw cell borders
            page.drawRectangle({
              x: currentX,
              y: exerciseY + 3,
              width: cellWidth,
              height: 15,
              borderColor: rgb(0, 0, 0),
              borderWidth: 2,
            });

            currentX += cellWidth; // Move to next column
          });

          // Move to the next row for formattedWords
          exerciseY -= 30;
          currentX = margin;

          columnNames.forEach(header => {
            const correctWords = exercise.data.correctAnswers[header] || [];
            const studentWords = studentCLT.formattedWords[header] || [];
            let wordX = currentX + 5;

            studentWords.forEach((word, wordIndex) => {

              if (correctWords.includes(word)) {
                page.drawText(word, {
                  x: wordX,
                  y: exerciseY + 22,
                  size: 8,
                  font: timesRomanFont,
                  color: rgb(0, 1, 0), // Green for correct
                });
              } else {
                page.drawText(word, {
                  x: wordX,
                  y: exerciseY + 22,
                  size: 8,
                  font: timesRomanFont,
                  color: rgb(1, 0, 0), // Red for incorrect
                });
              }

              wordX += timesRomanFont.widthOfTextAtSize(word, 8);

              // Draw separator if not the last word
              if (wordIndex !== studentWords.length - 1) {
                page.drawText(' - ', {
                  x: wordX,
                  y: exerciseY + 22,
                  size: 8,
                  font: timesRomanFont,
                  color: rgb(0, 0, 0),
                });
                wordX += timesRomanFont.widthOfTextAtSize(' - ', 8);
              }
            });

            // Draw borders for each cell
            page.drawRectangle({
              x: currentX,
              y: exerciseY + 3,
              width: cellWidth,
              height: 30,
              borderColor: rgb(0, 0, 0),
              borderWidth: 2,
            });

            currentX += cellWidth; // Move to the next column
          });

          // Adjust Y position for the next content
          exerciseY -= 15;
        } else if (exercise.type === 'RPF') {
          exerciseY -= 77;
          const studentScore = studentRPF.computedScore;
          const totalPoints = exercise.data.points;
          const { textLeft, textRight, correctAnswers } = exercise.data;
          const { studentAnswers } = studentRPF;

          // Draw RPF title with student score
          page.drawText(`${exerciseIndex + 1}- Relier par une flèche : `, {
            x: margin,
            y: exerciseY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          page.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Relier par une flèche : `, 8),
            y: exerciseY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });

          // Calculate the total width for textLeft and textRight (70% of the page width)
          const contentWidth = width * 0.7;
          const leftRightWidth = contentWidth / 2; // Divide the 70% width equally between left and right

          // Center the content by calculating the starting X position
          const centerX = (width - contentWidth) / 2;
          const leftX = centerX; // Starting X position for textLeft
          const rightX = centerX + leftRightWidth; // Starting X position for textRight

          let itemY = exerciseY - 10; // Start position for items

          // Lists to hold the (x, y) coordinates of the left and right items
          const leftCoords = [];
          const rightCoords = [];

          // Loop through the textLeft and textRight arrays to display items and draw connecting lines
          textLeft.forEach((leftText, index) => {
            // Calculate width of the left text
            const leftTextWidth = timesRomanFont.widthOfTextAtSize(`${leftText} •`, 8);

            // Draw left text with bullets (aligned to the right)
            page.drawText(`${leftText} •`, {
              x: leftX + 30 - leftTextWidth,  // Right-align by adjusting X position
              y: itemY,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });

            // Store coordinates for the left item
            leftCoords.push({ x: leftX + 30 - 5, y: itemY - 2 });

            // Draw right text with bullets
            const rightText = textRight[index];
            page.drawText(`• ${rightText}`, {
              x: rightX,
              y: itemY,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });

            // Store coordinates for the right item
            rightCoords.push({ x: rightX + 5, y: itemY - 2 });

            itemY -= 10; // Adjust Y position for the next row
          });

          // Draw lines connecting left and right items based on studentAnswers
          Object.entries(studentAnswers).forEach(([leftTerm, rightTerm]) => {
            // Find the index of the left term and the right term
            const leftIndex = textLeft.indexOf(leftTerm);
            const rightIndex = textRight.indexOf(rightTerm);

            if (leftIndex !== -1 && rightIndex !== -1) {
              const leftCoord = leftCoords[leftIndex];
              const rightCoord = rightCoords[rightIndex];

              // Determine the line color based on correctness
              const lineColor = correctAnswers[leftTerm] === rightTerm ? rgb(0, 1, 0) : rgb(1, 0, 0);

              // Draw line connecting left and right items
              page.drawLine({
                start: { x: leftCoord.x + 5, y: leftCoord.y + 5 },  // Adjust position for the line
                end: { x: rightCoord.x - 5, y: rightCoord.y + 5 },
                thickness: 1,
                color: lineColor,
              });
            }
          });
          exerciseY -= 15
        } else if (exercise.type === 'RLV') {
          const studentScore = studentRLV.computedScore;
          const totalPoints = exercise.data.points;

          // Draw RLV title with student score
          page.drawText(`${exerciseIndex + 1}- Remplir convenablement le vide avec les mots suivants :`, {
            x: margin,
            y: exerciseY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          // Draw score next to title
          page.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Remplir convenablement le vide avec les mots suivants : `, 8),
            y: exerciseY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });

          exerciseY -= 10;  // Adjust vertical position for the next element

          // Display the shuffled words
          page.drawText(exercise.data.shuffledWords.join(' - '), {
            x: (width - timesRomanFont.widthOfTextAtSize(exercise.data.shuffledWords.join(' - '), 8)) / 2,
            y: exerciseY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          exerciseY -= 10;  // Adjust for the phrases

          // Loop through each phrase and add the student answers
          exercise.data.phrases.forEach((phrase, phraseIndex) => {
            const splitPhrase = phrase.split(' ');
            let phraseX = margin;
            // Add the alphabet label (a), b), c), etc.)
            const label = String.fromCharCode(97 + phraseIndex) + ') ';
            page.drawText(label, {
              x: phraseX,
              y: exerciseY,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });
            phraseX += timesRomanFont.widthOfTextAtSize(String.fromCharCode(97 + phraseIndex) + ') ', 8)

            // Rebuild the phrase, replacing "................." with student answers
            let answerColors = [];
            splitPhrase.forEach((word, wordIndex) => {
              let answerColor = rgb(0, 0, 0)
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
                // Find the color for the given wordIndex
                const colorObj = answerColors.find(a => a.wordIndex === wordIndex);
                const color = colorObj ? colorObj.answerColor : rgb(0, 0, 0); // Default to black if no color found

                // Add the student's answer with color coding
                page.drawText(`${studentAnswer} `, {
                  x: phraseX,
                  y: exerciseY,
                  size: 8,
                  font: timesRomanFont,
                  color: color, // Use the found color
                });

                phraseX += timesRomanFont.widthOfTextAtSize(`${studentAnswer} `, 8);
              } else {
                page.drawText(`${word} `, {
                  x: phraseX,
                  y: exerciseY,
                  size: 8,
                  font: timesRomanFont,
                  color: rgb(0, 0, 0),
                });
                phraseX += timesRomanFont.widthOfTextAtSize(`${word} `, 8);
              }
            });
            exerciseY -= 13;  // Adjust vertical space for the next phrase
          });
        } else if (exercise.type === 'RLE') {
          exerciseY -= 60;
          const studentScore = studentRLE.computedScore;
          const totalPoints = exercise.data.points;

          // Draw RLV title with student score
          page.drawText(`${exerciseIndex + 1}- Remplir les entrées avec vos réponses :`, {
            x: margin,
            y: exerciseY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          // Draw score next to title
          page.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Remplir les entrées avec vos réponses : `, 8),
            y: exerciseY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });

          exerciseY -= 15;
          exercise.data.text.split('\n').map((line, lineIndex) => {
            let phraseX = margin
            // Add the alphabet label (a), b), c), etc.)
            const label = String.fromCharCode(97 + lineIndex) + ') ';
            page.drawText(label, {
              x: phraseX,
              y: exerciseY,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });
            phraseX += timesRomanFont.widthOfTextAtSize(String.fromCharCode(97 + lineIndex) + ') ', 8)

            line.split(/(\{.*?\})/g).map((part) => {
              if (part.match(/^\{.*?\}$/)) {
                let answerColor = rgb(0, 0, 0);
                if (studentRLE.studentAnswers[lineIndex] !== '') {

                  if (studentRLE.studentAnswers[lineIndex] === exercise.data.correctAnswers[lineIndex]) {
                    answerColor = rgb(0, 1, 0);
                  } else {
                    answerColor = rgb(1, 0, 0)
                  }

                  page.drawText(`${studentRLE.studentAnswers[lineIndex]}`, {
                    x: phraseX,
                    y: exerciseY,
                    size: 8,
                    font: customFont,
                    color: answerColor,
                  });
                  phraseX += customFont.widthOfTextAtSize(`${studentRLE.studentAnswers[lineIndex]}`, 8)
                } else {
                  page.drawText('.................', {
                    x: phraseX,
                    y: exerciseY,
                    size: 8,
                    font: customFont,
                    color: answerColor,
                  });
                  phraseX += customFont.widthOfTextAtSize('.................', 8)
                }
              } else {
                page.drawText(`${part}`, {
                  x: phraseX,
                  y: exerciseY,
                  size: 8,
                  font: customFont,
                  color: rgb(0, 0, 0),
                });
                phraseX += customFont.widthOfTextAtSize(`${part}`, 8)
              }

            })
            exerciseY -= 15;
          })
        } else if (exercise.type === 'OLE') {
          exerciseY -= 120;
          const studentScore = studentOLE.computedScore;
          const totalPoints = exercise.data.points;

          // Draw OLE title with student score
          page.drawText(`${exerciseIndex + 1}- Ordonner les étapes pour répondre correctement aux questions :`, {
            x: margin,
            y: exerciseY,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          // Draw score next to title
          const titleWidth = timesRomanFont.widthOfTextAtSize(`${exerciseIndex + 1}- Ordonner les étapes pour répondre correctement aux questions :`, 8);
          page.drawText(`(${studentScore} / ${totalPoints} pts)`, {
            x: margin + titleWidth + 5,
            y: exerciseY,
            size: 8,
            font: timesRomanBoldFont,
            color: rgb(1, 0, 0),
          });

          exerciseY -= 12; // Adjust Y position for the next section

          // Loop through the questions
          exercise.data.questions.forEach((question, questionIndex) => {
            const studentAnswer = studentOLE.studentAnswers.find(ans => ans.id === question.id);

            // Draw the question
            page.drawText(`${String.fromCharCode(97 + questionIndex)}) ${question.question} : `, {
              x: margin,
              y: exerciseY,
              size: 8,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            });

            page.drawText(`(${studentAnswer.questionScore} / ${question.points} pts)`, {
              x: margin + timesRomanFont.widthOfTextAtSize(`${String.fromCharCode(97 + questionIndex)}) ${question.question} : `, 8),
              y: exerciseY,
              size: 8,
              font: timesRomanBoldFont,
              color: rgb(1, 0, 0),
            });

            exerciseY -= 10; // Adjust Y position for the steps

            // Loop through the student's shuffled steps and compare with correct steps
            studentAnswer.shuffledSteps.forEach((step, stepIndex) => {
              const correctStep = question.steps[stepIndex];

              // Determine the color (green if correct, red if not)
              const stepColor = step === correctStep ? rgb(0, 1, 0) : rgb(1, 0, 0);

              // Draw the step text
              page.drawText(`é${stepIndex + 1}: `, {
                x: margin + 15,  // Indent the steps
                y: exerciseY,
                size: 8,
                font: timesRomanBoldFont,
                color: rgb(0, 0, 0),
              });

              page.drawText(`${step}`, {
                x: margin + 15 + timesRomanBoldFont.widthOfTextAtSize(`é${stepIndex + 1}: `, 8),  // Indent the steps
                y: exerciseY,
                size: 8,
                font: customFont,
                color: stepColor,
              });

              exerciseY -= 10; // Adjust Y position for the next step
            });

            exerciseY -= 2; // Extra spacing between questions
          });
        }







        // Update currentY for the next exercise or party
        currentY = exerciseY + 120;
      });

      /// Adjust spacing only if more parties follow, avoiding too much space between them
      if (partyIndex === 1) {
        currentY -= 345;
      }
    });

    // Save PDF to file
    const dir = path.join(__dirname, 'files', school, className);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const pdfFileName = `${number}- ${lastName} ${firstName}.pdf`;
    const pdfFilePath = path.join(dir, pdfFileName);
    const pdfBytes = await pdfDoc.save();

    fs.writeFileSync(pdfFilePath, pdfBytes);
    console.log('PDF created successfully.');

    return `http://localhost:5000/files/${school}/${className}/${pdfFileName}`;

  } catch (error) {
    console.error('Error creating PDF:', error);
  }
}

module.exports = { createPDF };
