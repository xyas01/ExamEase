import React, { useState, useRef, useEffect } from 'react';
import ArrowRight from '../../assets/ArrowRight.svg';

const RPF = ({ onSubmitRPF }) => {
    const [totalPoints, setTotalPoints] = useState(0);
    const [numPairs, setNumPairs] = useState(0);
    const [leftItems, setLeftItems] = useState([]);
    const [rightItems, setRightItems] = useState([]);
    const [isInputsAdded, setIsInputsAdded] = useState(false);
    const [links, setLinks] = useState([]);
    const [isFormatted, setIsFormatted] = useState(false);
    const [draggingItem, setDraggingItem] = useState(null);
    const [correctAnswers, setCorrectAnswers] = useState({});
    const svgRef = useRef(null);

    const handleTotalPointsChange = (e) => {
        setTotalPoints(parseFloat(e.target.value));
    };

    const handleNumPairsChange = (e) => {
        const num = parseInt(e.target.value);
        setNumPairs(num);
        setLeftItems(Array(num).fill(''));
        setRightItems(Array(num).fill(''));
    };

    const handleLeftItemChange = (index, value) => {
        const updatedItems = [...leftItems];
        updatedItems[index] = value;
        setLeftItems(updatedItems);
    };

    const handleRightItemChange = (index, value) => {
        const updatedItems = [...rightItems];
        updatedItems[index] = value;
        setRightItems(updatedItems);
    };

    const handleAddEntries = () => {
        setIsInputsAdded(true);
    };

    const handleDragStart = (index) => {
        setDraggingItem(index);
    };

    const handleDrop = (index) => {
        if (draggingItem !== null && !links.some(link => link.left === draggingItem && link.right === index)) {
            setLinks((prevLinks) => [...prevLinks, { left: draggingItem, right: index }]);
            setDraggingItem(null);
        } else {
            alert('deja lie')
        }
    };

    const handleDeleteLink = (leftIndex, rightIndex) => {
        setLinks((prevLinks) =>
            prevLinks.filter(link => !(link.left === leftIndex && link.right === rightIndex))
        );

        setCorrectAnswers((prevAnswers) => {
            const updatedAnswers = { ...prevAnswers };
            // Find the left item text and right item text
            const leftText = leftItems[leftIndex];
            const rightText = rightItems[rightIndex];
            if (leftText && rightText) {
                delete updatedAnswers[leftText];
            }
            return updatedAnswers;
        });
    };

    const handleAddAnswers = () => {
        const answerMap = {};
        links.forEach(link => {
            const leftText = leftItems[link.left];
            const rightText = rightItems[link.right];
            if (leftText && rightText) {
                answerMap[leftText] = rightText;
            }
        });
        setCorrectAnswers(answerMap);
    };

    const handleFormatExercise = () => {
        setIsFormatted(true);
        onSubmitRPF({
            totalPoints,
            textLeft: leftItems,
            textRight: rightItems,
            correctAnswers,
        });
    };

    useEffect(() => {
        if (svgRef.current) {
            const svg = svgRef.current;
            svg.innerHTML = '';

            links.forEach(link => {
                const leftElement = document.getElementById(`left-item-${link.left}`);
                const rightElement = document.getElementById(`right-item-${link.right}`);

                if (leftElement && rightElement) {
                    const leftRect = leftElement.getBoundingClientRect();
                    const rightRect = rightElement.getBoundingClientRect();

                    const startX = leftRect.right - svg.getBoundingClientRect().left;
                    const startY = leftRect.top + leftRect.height / 2 - svg.getBoundingClientRect().top;
                    const endX = rightRect.left - svg.getBoundingClientRect().left;
                    const endY = rightRect.top + rightRect.height / 2 - svg.getBoundingClientRect().top;

                    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    arrow.setAttribute('x1', startX);
                    arrow.setAttribute('y1', startY);
                    arrow.setAttribute('x2', endX);
                    arrow.setAttribute('y2', endY);
                    arrow.setAttribute('stroke', 'black');
                    arrow.setAttribute('stroke-width', '2');
                    arrow.setAttribute('marker-end', 'url(#arrowhead)');
                    svg.appendChild(arrow);
                }
            });
        }
    }, [links]);

    return (
        <div className="p-4 border border-gray-300 rounded-xl mt-4" style={{ fontFamily: 'Times New Roman' }}>
            {!isFormatted && (
                <>
                    <h2 className="text-lg mb-2">Relier par une flèche : <strong>({totalPoints} pts)</strong></h2>

                    <div className="flex justify-center gap-4 mb-4">
                        <div className="w-1/2">
                            <label className="block mb-2">Nombre de paires :</label>
                            <input
                                type="number"
                                value={numPairs}
                                onChange={handleNumPairsChange}
                                className="border rounded w-full px-2 py-1"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block mb-2">Nombre de points :</label>
                            <input
                                type="number"
                                value={totalPoints}
                                onChange={handleTotalPointsChange}
                                className="border rounded w-full px-2 py-1"
                            />
                        </div>
                    </div>

                    {isInputsAdded ? (
                        <div className="relative flex justify-center mb-4">
                            <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7"
                                        refX="10" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" />
                                    </marker>
                                </defs>
                            </svg>
                            <div className="flex justify-center items-center gap-36">
                                <div className="flex flex-col">
                                    {leftItems.map((item, index) => (
                                        <div
                                            key={index}
                                            id={`left-item-${index}`}
                                            className="flex items-center justify-end gap-2"
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                        >
                                            <span>{index + 1}- </span>
                                            <span>{item}</span>
                                            <span className="text-3xl">&#8226;</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col">
                                    {rightItems.map((item, index) => (
                                        <div
                                            key={index}
                                            id={`right-item-${index}`}
                                            className="flex items-center gap-2"
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={() => handleDrop(index)}
                                        >
                                            <span className="text-3xl">&#8226;</span>
                                            <span>{String.fromCharCode(97 + index)})</span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between gap-4 mb-4">
                            <div className="w-1/2">
                                {leftItems.map((item, index) => (
                                    <div key={index} className="mb-2">
                                        <label>{`Gauche ${index + 1} :`}</label>
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => handleLeftItemChange(index, e.target.value)}
                                            className="border rounded w-full px-2 py-1"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="w-1/2">
                                {rightItems.map((item, index) => (
                                    <div key={index} className="mb-2">
                                        <label>{`Droite ${index + 1} :`}</label>
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => handleRightItemChange(index, e.target.value)}
                                            className="border rounded w-full px-2 py-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isInputsAdded && (
                        <button onClick={handleAddEntries} className="bg-sky-500 text-white px-4 py-2 rounded-lg mb-4">
                            Ajouter les entrées
                        </button>
                    )}

                    {isInputsAdded && (
                        <button onClick={handleAddAnswers} className="bg-sky-500 text-white px-4 py-2 rounded-lg mb-4">
                            Ajouter les réponses
                        </button>
                    )}

                    {Object.entries(correctAnswers).length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-semibold">Liens créés :</h3>
                            <div className="flex gap-2">
                                {Object.entries(correctAnswers).map(([left, right], index) => {
                                    const leftIndex = leftItems.indexOf(left);
                                    const rightIndex = rightItems.indexOf(right);
                                    return (
                                        <div key={index} className="flex items-center border border-black rounded-md pl-2 pr-2">
                                            <p>{leftIndex + 1}-</p>
                                            <img src={ArrowRight} alt="ArrowRight" className="ml-1 mr-1 w-5 h-5" />
                                            <p>{String.fromCharCode(97 + rightIndex)})</p>
                                            <button
                                                onClick={() => handleDeleteLink(leftIndex, rightIndex)} // Pass indices here
                                                className="ml-2 text-sky-500"
                                            >
                                                &#10005;
                                            </button>
                                        </div>
                                    );
                                })}

                            </div>
                        </div>
                    )}

                    {Object.entries(correctAnswers).length > 0 && (
                        <button onClick={handleFormatExercise} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                            Formatter
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default RPF;
