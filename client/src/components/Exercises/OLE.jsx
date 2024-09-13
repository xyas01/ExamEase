import React, { useState, useEffect } from 'react';
import CloseSquare from '../../assets/CloseSquare.svg';

const OLE = ({ onSubmitOLE, initialNumberOfQuestions = 0 }) => {
    const [numberOfQuestions, setNumberOfQuestions] = useState(initialNumberOfQuestions);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        // Initialize questions state when number of questions changes
        setQuestions(Array.from({ length: numberOfQuestions }, (_, i) => ({
            id: i + 1,
            question: '',
            numberOfSteps: 2, // Default number of steps for each question
            steps: Array.from({ length: 2 }, () => ''),
            points: 1, // Default points per question
        })));
    }, [numberOfQuestions]);

    // Calculate the total points by summing up the points for each question
    const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);

    const handleNumberOfQuestionsChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setNumberOfQuestions(value);
    };

    const handleOLESubmit = () => {
        onSubmitOLE({
            questions,
            totalPoints,
        });
    };

    const handleDeleteQuestion = (questionId) => {
        setQuestions(questions.filter((q) => q.id !== questionId));
    };

    const handleNumberOfStepsChange = (e, questionId) => {
        const value = parseInt(e.target.value, 10);
        const updatedQuestions = questions.map(q =>
            q.id === questionId
                ? { ...q, numberOfSteps: value, steps: Array.from({ length: value }, () => '') }
                : q
        );
        setQuestions(updatedQuestions);
    };

    const handlePointsChange = (e, questionId) => {
        const value = parseFloat(e.target.value, 10);
        const updatedQuestions = questions.map(q =>
            q.id === questionId ? { ...q, points: value } : q
        );
        setQuestions(updatedQuestions);
    };

    return (
        <div className="p-4 border border-gray-300 rounded-xl mt-4" style={{ fontFamily: 'Times New Roman' }}>
            <h3 className="text-lg font-semibold mb-2">Créer un OLE</h3>
            <div className="flex gap-16">
                <label className="block mb-2">
                    Nombre de questions :
                    <input
                        type="number"
                        value={numberOfQuestions}
                        onChange={handleNumberOfQuestionsChange}
                        className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                </label>
                <div className="">
                    <h4>Total des points :</h4>
                    <h4 className='mt-2'>{totalPoints}</h4>
                </div>
            </div>
            <div className="flex flex-wrap gap-4">
                {questions.map((question, qIndex) => (
                    <div key={question.id} className="relative flex-1 min-w-[45%] border p-4 rounded-lg mb-4">
                        <div className="flex gap-4 items-center mb-4">
                            <label className="block mb-2">Question {qIndex + 1} :</label>
                            <div className='flex items-center gap-2'>
                                <label className="block mb-2">Points :</label>
                                <input
                                    type="number"
                                    value={question.points}
                                    onChange={(e) => handlePointsChange(e, question.id)}
                                    className="w-16 p-2 border border-gray-300 rounded-lg "
                                />
                            </div>
                            <div className='flex items-center gap-2'>
                                <label className="block mb-2">Nombre d'étapes :</label>
                                <input
                                    type="number"
                                    value={question.numberOfSteps}
                                    onChange={(e) => handleNumberOfStepsChange(e, question.id)}
                                    className="w-16 p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                        <button
                            className="absolute top-2 right-2"
                            onClick={() => handleDeleteQuestion(question.id)}
                        >
                            <img src={CloseSquare} alt="Delete" className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={question.question}
                            onChange={(e) => {
                                const updatedQuestions = questions.map(q =>
                                    q.id === question.id ? { ...q, question: e.target.value } : q
                                );
                                setQuestions(updatedQuestions);
                            }}
                            className="p-2 border border-gray-300 rounded-lg w-full mb-4"
                        />
                        <label className="block mb-2">Étapes :</label>
                        <div className="flex flex-col gap-2">
                            {question.steps.map((step, index) => (
                                <div key={index} className="flex items-center">
                                    <input
                                        type="text"
                                        value={step}
                                        onChange={(e) => {
                                            const updatedSteps = question.steps.map((stp, i) =>
                                                i === index ? e.target.value : stp
                                            );
                                            const updatedQuestions = questions.map(q =>
                                                q.id === question.id ? { ...q, steps: updatedSteps } : q
                                            );
                                            setQuestions(updatedQuestions);
                                        }}
                                        className="p-2 border border-gray-300 rounded-lg w-full"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={handleOLESubmit}
                className="bg-sky-500 text-white py-2 px-4 rounded-lg mt-4"
            >
                Formatter
            </button>
        </div>
    );
};

export default OLE;
