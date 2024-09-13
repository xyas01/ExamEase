import React, { useState, useEffect } from 'react';

const RLE = ({ onSubmitRLE }) => {
    const [totalPoints, setTotalPoints] = useState(0);
    const [text, setText] = useState('');
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [isFormatted, setIsFormatted] = useState(false);

    const handleTotalPointsChange = (e) => {
        const points = parseFloat(e.target.value);
        setTotalPoints(points);
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const handleFormatExercise = () => {
        const answers = text.match(/{(.*?)}/g)?.map((match) => match.slice(1, -1)) || [];
        setCorrectAnswers(answers);
        setIsFormatted(true);
    };

    useEffect(() => {
        if (isFormatted) {
            onSubmitRLE({
                totalPoints,
                text: text,
                correctAnswers: correctAnswers,
            });
        }
    }, [isFormatted, totalPoints, text, correctAnswers, onSubmitRLE]);

    return (
        <div className="p-4 border border-gray-300 rounded-xl mt-4" style={{ fontFamily: 'Times New Roman' }}>
            {!isFormatted && (
                <>
                    <h2>Remplir les entrées : <strong>({totalPoints} pts)</strong></h2>
                    <div className="mb-4">
                        <label className="block mb-2">Total points :</label>
                        <input
                            type="number"
                            value={totalPoints}
                            onChange={handleTotalPointsChange}
                            className="border rounded px-2 py-1"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Texte :</label>
                        <textarea
                            value={text}
                            onChange={handleTextChange}
                            rows="5"
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>
                    <button onClick={handleFormatExercise} className="bg-sky-500 text-white px-4 py-2 rounded-lg">
                        Formatter
                    </button>
                </>
            )}
        </div>
    );
};

export default RLE;
