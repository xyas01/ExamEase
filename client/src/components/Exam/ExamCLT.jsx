import React, { useState, useEffect } from 'react';

const ExamCLT = ({ isExam, exercise, exerciseIndex, onScoreUpdate }) => {
  const [formattedWords, setFormattedWords] = useState({});
  const [droppedWords, setDroppedWords] = useState([]);

  useEffect(() => {
    // Initialize formatted words based on the column headers
    const initialWords = {};
    (exercise?.data?.columnNames || exercise.columnNames || []).forEach(header => {
      initialWords[header] = [];
    });
    setFormattedWords(initialWords);
    setDroppedWords([]); // Reset dropped words when exercise changes
  }, [exercise]);

  useEffect(() => {
    if (isExam) {
      let computedScore = 0;
      const totalPoints = exercise?.data?.points || exercise.points;

      // Prepare correct answers structure for comparison
      const correctAnswers = exercise?.data?.correctAnswers || exercise.correctAnswers || {};

      // Loop through each column (header) and check the student's dropped words
      (exercise?.data?.columnNames || exercise.columnNames).forEach(header => {
        const correctWords = correctAnswers[header] || [];
        const studentWords = formattedWords[header] || [];

        const pointsPerWord = totalPoints / Object.values(correctAnswers).flat().length;

        // Check each student word under this header
        studentWords.forEach((word) => {
          if (correctWords.includes(word)) {
            computedScore += pointsPerWord;
          }
        });
      });


        onScoreUpdate('CLT',computedScore, totalPoints);
        // Store the result in localStorage
        const studentCLT = JSON.stringify({
          computedScore,
          formattedWords
      });
      localStorage.setItem('studentCLT', studentCLT);

    }
  }, [isExam, exercise, formattedWords, onScoreUpdate]);

  const shuffledWords = exercise?.data?.shuffledWords || exercise.shuffledWords || [];
  const columnNames = exercise?.data?.columnNames || exercise.columnNames || [];

  const handleDrop = (header, event) => {
    event.preventDefault();
    const droppedItem = event.dataTransfer.getData('text/plain');

    // Prevent dropping a word that’s already been dropped somewhere else
    if (droppedWords.includes(droppedItem)) {
      alert("Ce mot a déjà été utilisé. Veuillez le supprimer avant de l'utiliser à nouveau.");
      return;
    }

    const updatedFormattedWords = { ...formattedWords };
    const maxWordsAllowed = (exercise?.data?.words || exercise.words).length;

    if (updatedFormattedWords[header].length < maxWordsAllowed) {
      updatedFormattedWords[header] = [...updatedFormattedWords[header], droppedItem];
    } else {
      alert(`Seulement ${maxWordsAllowed} mot(s) sont autorisés dans cette case.`);
      return;
    }

    // Add the dropped word to the list of dropped words
    setDroppedWords([...droppedWords, droppedItem]);
    setFormattedWords(updatedFormattedWords);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDeleteWord = (header, word) => {
    const updatedFormattedWords = { ...formattedWords };
    const updatedDroppedWords = droppedWords.filter((w) => w !== word);

    // Remove the specific word from the cell
    updatedFormattedWords[header] = updatedFormattedWords[header].filter((w) => w !== word);

    setFormattedWords(updatedFormattedWords);
    setDroppedWords(updatedDroppedWords);
  };

  return (
    <>
      <p className="">
        {exerciseIndex + 1}- Compléter le tableau avec les mots appropriés :
        <strong>{` (${exercise?.data?.points || exercise.points} pt${(exercise?.data?.points || exercise.points) > 1 ? 's' : ''})`}</strong>
      </p>
      <div className="m-4">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {shuffledWords.map((word, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', word)}
              className="cursor-pointer border text-white rounded-xl px-4 py-2 bg-sky-500"
            >
              {word}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <table className="w-full h-36 border border-black">
            <thead>
              <tr>
                {columnNames.map((header, index) => (
                  <th key={index} className="border border-black p-2">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {columnNames.map((header, index) => (
                  <td
                    key={index}
                    className={`w-1/${columnNames.length} bg-gray-100 border border-black p-2`}
                    onDrop={(e) => handleDrop(header, e)}
                    onDragOver={handleDragOver}
                  >
                    {formattedWords[header]?.length ? (
                      <div className="flex gap-2 flex-wrap">
                        {formattedWords[header].map((word, i) => (
                          <span key={i} className="inline-flex border border-black p-2 rounded-md items-center">
                            {word}
                            <button
                              onClick={() => handleDeleteWord(header, word)}
                              className="ml-2 text-sky-500"
                            >
                              &#10005;
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      `Glissez un mot ici`
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ExamCLT;
