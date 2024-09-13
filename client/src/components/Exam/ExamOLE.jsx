import React, { useState, useEffect } from 'react';

const shuffleArray = (array) => {
  const shuffled = [...array];
  
  const arraysAreEqual = (arr1, arr2) => 
    arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);

  while (arraysAreEqual(shuffled, array)) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }

  return shuffled;
};

const ExamOLE = ({ isExam, exercise, exerciseIndex, onScoreUpdate }) => {
  const [studentAnswers, setStudentAnswers] = useState([]);

  // First useEffect: Shuffling steps only when the exercise changes
  useEffect(() => {
    if (exercise) {
      const questionsWithShuffledSteps = (exercise?.data?.questions || exercise.questions || []).map(question => ({
        ...question,
        shuffledSteps: shuffleArray([...question.steps]),
      }));
      setStudentAnswers(questionsWithShuffledSteps);
    }
  }, [exercise]);

  // Second useEffect: Computing score only when studentAnswers or isExam changes
  useEffect(() => {
    if (isExam && studentAnswers.length > 0) {
      let computedScore = 0;
      const totalPoints = exercise?.data?.points || exercise?.points || 0;

      const updatedStudentAnswers = studentAnswers.map((question, questionIndex) => {
        let questionScore = 0;
        const correctSteps = (exercise?.data?.questions || exercise.questions || [])[questionIndex];
        const pointsPerStep = correctSteps.points / correctSteps.steps.length;

        question.shuffledSteps.forEach((step, stepIndex) => {
          if (step === correctSteps.steps[stepIndex]) {
            computedScore += pointsPerStep;
            questionScore += pointsPerStep;
          }
        });

        return {
          ...question,
          questionScore,
        };
      });

      // Check if studentAnswers actually changed to avoid re-setting state unnecessarily
      const isEqual = updatedStudentAnswers.every((question, index) => 
        question.questionScore === studentAnswers[index]?.questionScore
      );

      if (!isEqual) {
        setStudentAnswers(updatedStudentAnswers); // Update with questionScore
      }

      onScoreUpdate('OLE', computedScore, totalPoints);

      // Store in localStorage
      const studentOLE = JSON.stringify({
        computedScore,
        studentAnswers: updatedStudentAnswers,
      });
      localStorage.setItem('studentOLE', studentOLE);
    }
  }, [isExam, exercise, studentAnswers, onScoreUpdate]);

  const handleDragStart = (questionIndex, stepIndex) => (event) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ questionIndex, stepIndex }));
  };

  const handleDrop = (questionIndex, dropIndex) => (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    if (!data) return;

    const { questionIndex: dragQuestionIndex, stepIndex: dragStepIndex } = JSON.parse(data);
    if (dragQuestionIndex !== questionIndex) return;

    const newStudentAnswers = [...studentAnswers];
    const temp = newStudentAnswers[questionIndex].shuffledSteps[dragStepIndex];
    newStudentAnswers[questionIndex].shuffledSteps[dragStepIndex] = newStudentAnswers[questionIndex].shuffledSteps[dropIndex];
    newStudentAnswers[questionIndex].shuffledSteps[dropIndex] = temp;

    setStudentAnswers(newStudentAnswers);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <p className="mb-2">
        {exerciseIndex + 1}- Ordonner les étapes pour répondre correctement aux questions :
        <strong>{` (${exercise?.data?.points || exercise.points} pt${(exercise?.data?.points || exercise.points) > 1 ? 's' : ''})`}</strong>
      </p>
      <div className="">
        {(exercise?.data?.questions || exercise.questions || []).map((question, questionIndex) => (
          <div key={questionIndex} className="mb-4">
            <p className="font-medium mb-2">
              {`${String.fromCharCode(97 + questionIndex)}) ${question.question}`} : <strong>{` (${question.points} pt${question.points > 1 ? 's' : ''})`}</strong>
            </p>
            <div className="flex flex-col gap-2">
              {(studentAnswers[questionIndex]?.shuffledSteps || []).map((step, stepIndex) => (
                <div
                  key={stepIndex}
                  className="flex items-center"
                >
                  <span className="mr-1 font-bold">é{stepIndex + 1}: </span>
                  <span
                    draggable
                    onDragStart={handleDragStart(questionIndex, stepIndex)}
                    onDrop={handleDrop(questionIndex, stepIndex)}
                    onDragOver={handleDragOver}
                    className="px-4 py-2 bg-sky-500 text-white rounded-xl cursor-move"
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ExamOLE;
