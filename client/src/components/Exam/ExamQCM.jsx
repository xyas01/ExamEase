import React, { useEffect } from 'react';

const ExamQCM = ({ userResponses, partieIndex, exerciseIndex, exercise, handleOptionChange, onScoreUpdate }) => {

    useEffect(() => {
        if (userResponses) {

            let computedScore = 0;
            const totalPoints = exercise?.data?.points || exercise.points;
            const questions = exercise?.data?.questions || exercise.questions || [];

            questions.forEach((question) => {
                const userAnswer = userResponses[`${partieIndex}-${question.id}`];
                const isCorrect = userAnswer === question.correctAnswer;

                if (isCorrect) {
                    computedScore += totalPoints / questions.length;
                }
            });

            onScoreUpdate('QCM', computedScore, totalPoints);

            // Store the result in localStorage
            const studentQCM = JSON.stringify({
                computedScore, 
                userResponses
              });                                      
            localStorage.setItem('studentQCM', studentQCM);
        }
    }, [exercise, userResponses, partieIndex, onScoreUpdate]);

    return (
        <>
            <p className="">
                {exerciseIndex + 1}- Choisir la bonne réponse :
                <strong>{` (${exercise?.data?.points || exercise.points} pt${(exercise?.data?.points || exercise.points) > 1 ? 's' : ''})`}</strong>
            </p>
            <div className="flex flex-wrap gap-4">

                {(exercise?.data?.questions || exercise.questions || []).map((question, questionIndex) => (
                    <div key={questionIndex} className="flex-1 min-w-[45%] p-2 bg-gray-100 rounded-lg">
                        <div className="flex justify-between items-center">
                            <p className="font-medium">
                                {question.question}
                            </p>
                        </div>

                        <div className="mt-2 space-y-2">
                            {question.answers.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`question-${partieIndex}-${question.id}`}
                                        id={`option-${partieIndex}-${question.id}-${optIndex}`}
                                        className="w-3 h-3"
                                        onChange={() => handleOptionChange(partieIndex, question.id, optIndex)}
                                    />
                                    <label
                                        htmlFor={`option-${partieIndex}-${question.id}-${optIndex}`}
                                        className="text-md"
                                    >
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ExamQCM;
