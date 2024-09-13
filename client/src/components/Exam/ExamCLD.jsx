import React, { useEffect } from 'react';

const ExamCLD = ({ isExam, exercise, exerciseIndex, formattedResponses, handleDrop, handleDragOver, onScoreUpdate }) => {

    useEffect(() => {
        if (isExam) {

            let computedScore = 0;
            const totalPoints = exercise?.data?.points || exercise.points;
            const numberOfResponses = exercise?.data?.responses?.length || exercise.responses;
            let correctResponses = 0;

            formattedResponses.forEach((response, index) => {
                if (response === (exercise?.data?.responses || exercise.responses)[index]) {
                    correctResponses += 1;
                }
            });

            const pointsPerResponse = totalPoints / numberOfResponses;
            computedScore = correctResponses * pointsPerResponse;

            onScoreUpdate('CLD', computedScore, totalPoints);

            // Store the result in localStorage
            const studentCLD = JSON.stringify({
                computedScore,
                formattedResponses
            });
            localStorage.setItem('studentCLD', studentCLD);
        }
    }, [isExam, exercise, formattedResponses, onScoreUpdate]);

    return (
        <>
            <p className="">
                {exerciseIndex + 1}- Compléter le dessin :
                <strong>{` (${exercise?.data?.points || exercise.points} pt${(exercise?.data?.points || exercise.points) > 1 ? 's' : ''})`}</strong>
            </p>
            <div>
                <div className="flex justify-center m-4 gap-2">
                    {(exercise?.data?.shuffledResponses || exercise.shuffledResponses).map((response, index) => (
                        <div
                            key={index}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('text/plain', response)}
                            className="cursor-pointer border text-white rounded-xl px-4 py-2 bg-sky-500"
                        >
                            {response}
                        </div>
                    ))}
                </div>
                <div className="flex gap-4">
                    <div>
                        {formattedResponses.map((response, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <p>{index + 1}- </p>
                                <div
                                    className="border p-2 rounded bg-gray-100 min-w-[200px]"
                                    onDrop={(e) => handleDrop(index, e)}
                                    onDragOver={handleDragOver}
                                >
                                    {response || `Glissez une réponse ici`}
                                </div>
                            </div>
                        ))}
                    </div>
                    {(exercise?.data?.image || exercise.image) && (
                        <div className="flex">
                            <img src={exercise?.data?.image || exercise.image} alt="Uploaded drawing" className="max-w-full h-auto border rounded" />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ExamCLD;
