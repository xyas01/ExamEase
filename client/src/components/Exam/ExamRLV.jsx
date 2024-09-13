import React, { useEffect, useState } from 'react';

const ExamRLV = ({ isExam, exercise, exerciseIndex, onScoreUpdate }) => {
  const [studentAnswers, setStudentAnswers] = useState([]);

  useEffect(() => {
    const phrases = exercise?.data?.phrases || exercise.phrases;
    const initialAnswers = phrases.flatMap((phrase, phraseIndex) =>
      phrase.split(' ').map((word, wordIndex) => 
        word === '.................' ? { phraseIndex, wordIndex, answer: '' } : null
      ).filter(item => item !== null)
    );
    setStudentAnswers(initialAnswers);
  }, [exercise]);

  useEffect(() => {
    if (isExam) {
      let computedScore = 0;
      const totalPoints = exercise?.data?.points || exercise.points;
      const correctAnswers = exercise?.data?.correctAnswers || exercise.correctAnswers;
      let correctResponses = 0;

      studentAnswers.forEach(({ phraseIndex, wordIndex, answer }, index) => {
        if (answer === correctAnswers[index]) {
          correctResponses += 1;
        }
      });

      const pointsPerResponse = totalPoints / studentAnswers.length;
      computedScore = correctResponses * pointsPerResponse;

      onScoreUpdate('RLV', computedScore, totalPoints);
      const studentRLV = JSON.stringify({
        computedScore,
        studentAnswers
      });
      localStorage.setItem('studentRLV', studentRLV);
    }
  }, [isExam, exercise, studentAnswers, onScoreUpdate]);

  const handleDrop = (phraseIndex, wordIndex, event) => {
    event.preventDefault();
    const droppedItem = event.dataTransfer.getData('text/plain');
    const updatedStudentAnswers = studentAnswers.map(item => 
      item.phraseIndex === phraseIndex && item.wordIndex === wordIndex
        ? { ...item, answer: droppedItem }
        : item
    );
    setStudentAnswers(updatedStudentAnswers);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <p>
        {exerciseIndex + 1}- Remplir convenablement le vide avec les mots suivants :
        <strong>{` (${exercise?.data?.points || exercise.points} pt${(exercise?.data?.points || exercise.points) > 1 ? 's' : ''})`}</strong>
      </p>
      <div>
        <div className="flex justify-center m-4 gap-2">
          {(exercise?.data?.shuffledWords || exercise.shuffledWords).map((word, index) => (
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
        <div className="flex flex-col gap-4">
          <div className="mb-4">
            {(exercise?.data?.phrases || exercise.phrases).map((phrase, phraseIndex) => (
              <div key={phraseIndex} className="flex mb-2">
                <p>{String.fromCharCode(97 + phraseIndex)}) </p>
                <div className="flex flex-wrap items-center">
                  {phrase.split(' ').map((word, wordIndex) =>
                    word === '.................' ? (
                      <div
                        key={wordIndex}
                        className="border rounded-xl px-4 py-2 mx-1"
                        onDrop={(e) => handleDrop(phraseIndex, wordIndex, e)}
                        onDragOver={handleDragOver}
                      >
                        {
                          studentAnswers.find(
                            item => item.phraseIndex === phraseIndex && item.wordIndex === wordIndex
                          )?.answer || word
                        }
                      </div>
                    ) : (
                      <span key={wordIndex} className="">&nbsp;{word}</span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamRLV;
