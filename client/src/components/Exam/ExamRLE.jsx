import React, { useEffect, useState } from 'react';

const ExamRLE = ({ isExam, exercise, exerciseIndex, onScoreUpdate }) => {
    const [studentAnswers, setStudentAnswers] = useState([]);

    useEffect(() => {
        // Initialize studentAnswers with empty strings for each input field
        const initialAnswers = Array((exercise?.data?.correctAnswers || exercise.correctAnswers).length).fill('');
        setStudentAnswers(initialAnswers);
    }, [exercise]);

    useEffect(() => {
        if (isExam) {
            let computedScore = 0;
            const totalPoints = exercise?.data?.points || exercise.points || 0;
            const correctAnswers = exercise?.data?.correctAnswers || exercise.correctAnswers || [];
            let correctResponses = 0;

            studentAnswers.forEach((answer, index) => {
                if (answer.trim() === correctAnswers[index].trim()) {
                    correctResponses += 1;
                }
            });

            const pointsPerResponse = totalPoints / correctAnswers.length;
            computedScore = correctResponses * pointsPerResponse;

                onScoreUpdate('RLE',computedScore, totalPoints);
                const studentRLE = JSON.stringify({
                    computedScore,
                    studentAnswers
                  });
                  localStorage.setItem('studentRLE', studentRLE);
        }
    }, [isExam, exercise, studentAnswers, onScoreUpdate]);

    const handleInputChange = (index, value) => {
        const updatedAnswers = [...studentAnswers];
        updatedAnswers[index] = value;
        setStudentAnswers(updatedAnswers);
    };

    return (
        <>
            <p className="">
                {exerciseIndex + 1}- Remplir les entrées avec vos réponses :
                <strong>{` (${exercise?.data?.points || exercise.points} pt${(exercise?.data?.points || exercise.points) > 1 ? 's' : ''})`}</strong>
            </p>
            <div className="flex flex-col gap-4">
                <div className="mb-4">
                    {(exercise?.data?.text || exercise.text).split('\n').map((line, lineIndex) => (
                        <div key={lineIndex} className="flex mb-2 items-center">
                            <p>{String.fromCharCode(97 + lineIndex)}) </p>
                            {line.split(/(\{.*?\})/g).map((part, partIndex) => (
                                part.match(/^\{.*?\}$/) ? (
                                    <input
                                        key={partIndex}
                                        type="text"
                                        className="border rounded-xl px-4 py-2 ml-1"           
                                        onChange={(e) => handleInputChange(lineIndex, e.target.value)}
                                    />
                                ) : (
                                    <span key={partIndex}>&nbsp;{part}</span>
                                )
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ExamRLE;
