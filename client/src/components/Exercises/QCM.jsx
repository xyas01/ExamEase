import React, { useState, useEffect } from 'react';
import CloseSquare from '../../assets/CloseSquare.svg';

const QCM = ({ onSubmitQCM, initialNumberOfQuestions = 0, initialNumberOfAnswers = 2 }) => {
    const [numberOfQuestions, setNumberOfQuestions] = useState(initialNumberOfQuestions);
    const [numberOfAnswers, setNumberOfAnswers] = useState(initialNumberOfAnswers);
    const [questions, setQuestions] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [pointsPerQuestion, setPointsPerQuestion] = useState(0);

    useEffect(() => {
        // Calculate points per question whenever number of questions or total points change
        if (numberOfQuestions > 0 && totalPoints > 0) {
            setPointsPerQuestion(Math.floor(totalPoints / numberOfQuestions));
        } else {
            setPointsPerQuestion(0);
        }
    }, [numberOfQuestions, totalPoints]);

    useEffect(() => {
        // Initialize questions state when number of questions or answers changes
        setQuestions(Array.from({ length: numberOfQuestions }, (_, i) => ({
            id: i + 1,
            question: '',
            answers: Array.from({ length: numberOfAnswers }, () => ''),
            correctAnswer: null, // Initialize correctAnswer
            points: pointsPerQuestion,
        })));
    }, [numberOfQuestions, numberOfAnswers, pointsPerQuestion]);

    const handleNumberOfQuestionsChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setNumberOfQuestions(value);
    };

    const handleNumberOfAnswersChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setNumberOfAnswers(value);
    };

    const handleTotalPointsChange = (e) => {
        setTotalPoints(parseInt(e.target.value, 10));
    };

    const handleAnswerChange = (questionId, answerIndex) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                q.id === questionId ? { ...q, correctAnswer: answerIndex } : q
            )
        );
    };

    const handleQCMSubmit = () => {
        onSubmitQCM({
            questions,
            totalPoints,
        });
    };

    const handleDeleteQuestion = (questionId) => {
        setQuestions(questions.filter((q) => q.id !== questionId));
    };

    return (
        <div className="p-4 border border-gray-300 rounded-xl mt-4" style={{ fontFamily: 'Times New Roman' }}>
            <h3 className="text-lg font-semibold mb-2">Créer un QCM</h3>
            <div className="flex gap-2">
                <label className="block mb-2">
                    Nombre de questions :
                    <input
                        type="number"
                        value={numberOfQuestions}
                        onChange={handleNumberOfQuestionsChange}
                        className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                </label>
                <label className="block mb-2">
                    Nombre de réponses par question :
                    <input
                        type="number"
                        value={numberOfAnswers}
                        onChange={handleNumberOfAnswersChange}
                        className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                </label>
                <label className="block mb-2">
                    Total des points :
                    <input
                        type="number"
                        value={totalPoints}
                        onChange={handleTotalPointsChange}
                        className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                </label>
            </div>
            <div className="flex flex-wrap gap-4">
                {questions.map((question, qIndex) => (
                    <div key={question.id} className="relative flex-1 min-w-[45%] border p-4 rounded-lg">
                        <label className="block mb-2">Question {qIndex + 1} :</label>
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
                        <label className="block mb-2">Réponses :</label>
                        <div className="flex flex-col gap-2">
                            {question.answers.map((answer, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={answer}
                                    onChange={(e) => {
                                        const updatedAnswers = question.answers.map((ans, i) =>
                                            i === index ? e.target.value : ans
                                        );
                                        const updatedQuestions = questions.map(q =>
                                            q.id === question.id ? { ...q, answers: updatedAnswers } : q
                                        );
                                        setQuestions(updatedQuestions);
                                    }}
                                    className="p-2 border border-gray-300 rounded-lg w-full"
                                />
                            ))}
                        </div>
                        <label className="block mt-4 mb-2">Choisir la bonne réponse :</label>
                        {question.answers.map((answer, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    checked={question.correctAnswer === index}
                                    onChange={() => handleAnswerChange(question.id, index)}
                                    className="mr-2"
                                />
                                <span>{String.fromCharCode(97 + index)} - {answer}</span>
                            </div>
                        ))}

                    </div>
                ))}
            </div>
            <button
                onClick={handleQCMSubmit}
                className="bg-sky-500 text-white py-2 px-4 rounded-lg mt-4"
            >
                Soumettre QCM
            </button>
        </div>
    );
};

export default QCM;
