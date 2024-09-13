import React, { useState, useRef, useEffect } from 'react';
import ArrowRight from '../../assets/ArrowRight.svg';

const ExamRPF = ({
    exercise,
    exerciseIndex,
    isExam,
    onScoreUpdate
}) => {
    const leftItems = exercise?.data?.textLeft || exercise.textLeft;
    const rightItems = exercise?.data?.textRight || exercise.textRight;
    const correctAnswers = exercise?.data?.correctAnswers || exercise.correctAnswers;
    const [links, setLinks] = useState([]);
    const [draggingItem, setDraggingItem] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({});
    const svgRef = useRef(null);

    const userRole = localStorage.getItem('role');

    useEffect(() => {
        if (isExam) {
            let computedScore = 0;
            const totalPoints = exercise?.data?.points || exercise.points;
            const pointsPerCorrectAnswer = totalPoints / Object.keys(correctAnswers).length;

            Object.entries(studentAnswers).forEach(([left, right]) => {
                if (correctAnswers[left] === right) {
                    computedScore += pointsPerCorrectAnswer;
                }
            });

            onScoreUpdate('RPF', computedScore, totalPoints);
            // Store the result in localStorage
            const studentRPF = JSON.stringify({
                computedScore,
                studentAnswers
            });
            localStorage.setItem('studentRPF', studentRPF);
        }
    }, [isExam, exercise, studentAnswers, correctAnswers, onScoreUpdate]);

    const handleDragStart = (index) => setDraggingItem(index);

    const handleDrop = (index) => {
        if (draggingItem !== null && !links.some(link => link.left === draggingItem && link.right === index)) {
            setLinks(prev => [...prev, { left: draggingItem, right: index }]);
            setDraggingItem(null);
        }
    };

    const handleDeleteLink = (leftIndex, rightIndex) => {
        setLinks(prev => prev.filter(link => !(link.left === leftIndex && link.right === rightIndex)));
        setStudentAnswers(prev => {
            const updatedAnswers = { ...prev };
            const leftText = leftItems[leftIndex];
            const rightText = rightItems[rightIndex];
            if (leftText && rightText) {
                delete updatedAnswers[leftText];
            }
            return updatedAnswers;
        });
    };

    const handleAddAnswers = () => {
        const answerMap = links.reduce((acc, link) => {
            const leftText = leftItems[link.left];
            const rightText = rightItems[link.right];
            if (leftText && rightText) acc[leftText] = rightText;
            return acc;
        }, {});
        setStudentAnswers(answerMap);
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
        <div style={{ fontFamily: 'Times New Roman' }}>
            <h2 className="tetx-gray-600">{exerciseIndex + 1}- Relier par une flèche : <strong>({exercise?.data?.points || exercise.points} pts)</strong></h2>

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
            {userRole !== 'professeur' && (
                <>
                    {Object.entries(studentAnswers).length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-semibold">Liens créés :</h3>
                            <div className="flex gap-2">
                                {Object.entries(studentAnswers).map(([left, right], index) => {
                                    const leftIndex = leftItems.indexOf(left);
                                    const rightIndex = rightItems.indexOf(right);
                                    return (
                                        <div key={index} className="flex items-center border border-black rounded-md pl-2 pr-2">
                                            <p>{leftIndex + 1}-</p>
                                            <img src={ArrowRight} alt="ArrowRight" className="ml-1 mr-1 w-5 h-5" />
                                            <p>{String.fromCharCode(97 + rightIndex)})</p>
                                            <button
                                                onClick={() => handleDeleteLink(leftIndex, rightIndex)}
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

                    <button onClick={handleAddAnswers} className="bg-sky-500 text-white px-4 py-2 rounded-lg mb-4">
                        Ajouter mes réponses
                    </button>
                </>
            )}
        </div >
    );
};

export default ExamRPF;
