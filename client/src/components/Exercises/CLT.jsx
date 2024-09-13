import React, { useState } from 'react';

const CLT = ({ onSubmitCLT }) => {
    const [numWords, setNumWords] = useState(0);
    const [numColumns, setNumColumns] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [words, setWords] = useState([]);
    const [columnNames, setColumnNames] = useState([]);
    const [isFormatted, setIsFormatted] = useState(false);
    const [selectedHeader, setSelectedHeader] = useState('');
    const [selectedWords, setSelectedWords] = useState([]);
    const [correctAnswers, setCorrectAnswers] = useState({});

    const handleNumWordsChange = (e) => {
        const number = parseInt(e.target.value);
        setNumWords(number);
        setWords(Array(number).fill(''));
    };

    const handleTotalPointsChange = (e) => {
        const points = parseFloat(e.target.value);
        setTotalPoints(points);
    };

    const handleWordChange = (index, value) => {
        const updatedWords = [...words];
        updatedWords[index] = value;
        setWords(updatedWords);
    };

    const handleNumColumnsChange = (e) => {
        const columns = parseInt(e.target.value);
        setNumColumns(columns);
        setColumnNames(Array(columns).fill(''));
    };

    const handleColumnNameChange = (index, value) => {
        const updatedColumnNames = [...columnNames];
        updatedColumnNames[index] = value;
        setColumnNames(updatedColumnNames);
    };

    const handleHeaderSelection = (e) => {
        setSelectedHeader(e.target.value);
        setSelectedWords([]); // Reset selected words when changing header
    };

    const handleCheckboxChange = (word) => {
        setSelectedWords((prevSelectedWords) =>
            prevSelectedWords.includes(word)
                ? prevSelectedWords.filter((w) => w !== word)
                : [...prevSelectedWords, word]
        );
    };

    const handleAddAnswer = () => {
        if (selectedHeader && selectedWords.length > 0) {
            setCorrectAnswers((prev) => {
                const updated = { ...prev };
                updated[selectedHeader] = (updated[selectedHeader] || []).concat(selectedWords);
                return updated;
            });
            setSelectedWords([]); // Reset selected words after adding
        }
    };

    const handleDeleteAnswer = (header, word) => {
        setCorrectAnswers((prev) => {
            const updated = { ...prev };
            updated[header] = updated[header].filter((w) => w !== word);
            if (updated[header].length === 0) {
                delete updated[header];
            }
            return updated;
        });
    };

    const handleFormatExercise = () => {
        const shuffleArray = (array) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };

        let shuffledWords = shuffleArray(words);
        while (JSON.stringify(shuffledWords) === JSON.stringify(words)) {
            shuffledWords = shuffleArray(words);
        }

        setIsFormatted(true);

        onSubmitCLT({
            totalPoints,
            words,
            shuffledWords,
            columnNames,
            correctAnswers,
        });
    };

    return (
        <div className="p-4 border border-gray-300 rounded-xl mt-4" style={{ fontFamily: 'Times New Roman' }}>
            {!isFormatted && (
                <>
                    <h2 className="text-lg">Compléter le tableau avec les mots appropriés : <strong>({totalPoints} pts)</strong></h2>
                    <div className="flex gap-4">
                        <div className="mb-4">
                            <label className="block mb-2">Nombre de mots :</label>
                            <input
                                type="number"
                                value={numWords}
                                onChange={handleNumWordsChange}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Nombre de colonnes :</label>
                            <input
                                type="number"
                                value={numColumns}
                                onChange={handleNumColumnsChange}
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
                        {words.map((word, index) => (
                            <div key={index} className="mb-2">
                                <label>{`Mot ${index + 1} :`}</label>
                                <input
                                    type="text"
                                    value={word}
                                    onChange={(e) => handleWordChange(index, e.target.value)}
                                    className="border rounded px-2 py-1 ml-2"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mb-4">
                        {columnNames.map((columnName, index) => (
                            <div key={index} className="mb-2">
                                <label>{`Nom de la colonne ${index + 1} :`}</label>
                                <input
                                    type="text"
                                    value={columnName}
                                    onChange={(e) => handleColumnNameChange(index, e.target.value)}
                                    className="border rounded px-2 py-1 ml-2"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-16">
                        <div className="mb-4">
                            <label className="block mb-2">Sélectionnez un en-tête :</label>
                            <select value={selectedHeader} onChange={handleHeaderSelection} className="border rounded px-2 py-1">
                                <option value="">-- Choisir un en-tête --</option>
                                {columnNames.map((header, index) => (
                                    <option key={index} value={header}>
                                        {header}
                                    </option>
                                ))}
                            </select>
                        </div>



                        {selectedHeader && (
                            <div className="mb-4">
                                <label className="block mb-2">Sélectionnez les mots corrects :</label>
                                {words.map((word, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            onChange={() => handleCheckboxChange(word)}
                                            checked={selectedWords.includes(word)}
                                            className="mr-2"
                                        />
                                        <label>{word}</label>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button onClick={handleAddAnswer} className="bg-sky-500 h-10 text-white px-4 rounded-lg mb-4">
                            Ajouter la réponse
                        </button>
                    </div>



                    <div className="mb-4">
                        {Object.entries(correctAnswers).map(([header, words]) => (
                            <div key={header} className="flex items-center mb-2">
                                <strong>{header}:</strong>
                                
                                {words.map((word) => (
                                    <div className=" flex gap-2 border border-black rounded-md pl-2 pr-2 ml-2">
                                        <span className="">
                                    {word}
                                </span>
                                    <button
                                        key={word}
                                        onClick={() => handleDeleteAnswer(header, word)}
                                        className="text-sky-500"
                                    >
                                        &#10005;
                                    </button>
                                    </div>
                                ))}
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

export default CLT;
