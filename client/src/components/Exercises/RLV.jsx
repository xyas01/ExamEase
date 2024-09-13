import React, { useState } from 'react';

const RLV = ({ onSubmitRLV }) => {
    const [numPhrases, setNumPhrases] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [phrases, setPhrases] = useState([]);
    const [isFormatted, setIsFormatted] = useState(false);

    const handleNumPhrasesChange = (e) => {
        const number = parseInt(e.target.value, 10);
        setNumPhrases(number);
        setPhrases(Array(number).fill(''));
    };

    const handleTotalPointsChange = (e) => {
        const points = parseFloat(e.target.value);
        setTotalPoints(points);
    };

    const handlePhraseChange = (index, value) => {
        const updatedPhrases = [...phrases];
        updatedPhrases[index] = value;
        setPhrases(updatedPhrases);
    };

    const handleFormatExercise = () => {
        const answers = [];
        const updatedPhrases = phrases.map((phrase) => {
            return phrase.replace(/{(.*?)}/g, (match, p1) => {
                answers.push(p1);
                return '.................';
            });
        });

        // Fisher-Yates Shuffle for better randomization
        const shuffleArray = (array) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
          };
        
          let randomizedWords = shuffleArray(answers);
        
          // Ensure randomizedWords is actually different from responses
          while (JSON.stringify(randomizedWords) === JSON.stringify(answers)) {
            randomizedWords = shuffleArray(answers);
          }

        setIsFormatted(true);

        // Use the updated state values for onSubmitRLV
        onSubmitRLV({
            totalPoints,
            formattedPhrases: updatedPhrases,
            correctAnswers: answers,
            shuffledWords: randomizedWords,
        });
    };

    return (
        <div className="p-4 border border-gray-300 rounded-xl mt-4" style={{ fontFamily: 'Times New Roman' }}>
            {!isFormatted && (
                <>
                    <h2>Remplir le vide : <strong>({totalPoints} pts)</strong></h2>
                    <div className="flex gap-4">
                        <div className="mb-4">
                            <label className="block mb-2">Nombre de phrases :</label>
                            <input
                                type="number"
                                value={numPhrases}
                                onChange={handleNumPhrasesChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Total points :</label>
                            <input
                                type="number"
                                value={totalPoints}
                                onChange={handleTotalPointsChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        {phrases.map((phrase, index) => (
                            <div key={index} className="mb-2">
                                <label>{`Phrase ${index + 1} :`}</label>
                                <input
                                    type="text"
                                    value={phrase}
                                    onChange={(e) => handlePhraseChange(index, e.target.value)}
                                    className="w-96 border rounded px-2 py-1 ml-2"
                                />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleFormatExercise} className="bg-sky-500 text-white px-4 py-2 rounded-lg">
                        Formatter
                    </button>
                </>
            )}
        </div>
    );
};

export default RLV;
