import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { v4 } from 'uuid';
import axios from 'axios';
import Grade from './Grade';
import ExamQCM from './ExamQCM';
import ExamCLD from './ExamCLD';
import ExamCLT from './ExamCLT';
import ExamRPF from './ExamRPF';
import ExamRLV from './ExamRLV';
import ExamRLE from './ExamRLE';
import ExamOLE from './ExamOLE';

const Main = ({ userRole }) => {
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [details, setDetails] = useState({});
    const [finalized, setFinalized] = useState(false);
    const [isCalculated, setIsCalculated] = useState(false);
    const [totalScore, setTotalScore] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [userResponses, setUserResponses] = useState({});
    const [isCertified, setIsCertified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();
    const [formattedResponses, setFormattedResponses] = useState([]);
    const [answerId, setAnswerId] = useState(null)
    const [fileUrl, setFileUrl] = useState('');


    const localUsers = JSON.parse(localStorage.getItem('users')) || {};
    const { school, className, lastname, firstname, number } = localUsers[0] || '';

    useEffect(() => {
        const createDocument = async () => {
            if (isCompleted) {
                try {
                    // Fetch studentQCM from localStorage if it exists
                    const studentQCM = localStorage.getItem('studentQCM');
                    const parsedStudentQCM = studentQCM ? JSON.parse(studentQCM) : null;

                    // Fetch studentQCM from localStorage if it exists
                    const studentCLD = localStorage.getItem('studentCLD');
                    const parsedStudentCLD = studentCLD ? JSON.parse(studentCLD) : null;

                    // Fetch studentQCM from localStorage if it exists
                    const studentCLT = localStorage.getItem('studentCLT');
                    const parsedStudentCLT = studentCLT ? JSON.parse(studentCLT) : null;

                    // Fetch studentQCM from localStorage if it exists
                    const studentRPF = localStorage.getItem('studentRPF');
                    const parsedStudentRPF = studentRPF ? JSON.parse(studentRPF) : null;

                    // Fetch studentQCM from localStorage if it exists
                    const studentRLV = localStorage.getItem('studentRLV');
                    const parsedStudentRLV = studentRLV ? JSON.parse(studentRLV) : null;

                    // Fetch studentQCM from localStorage if it exists
                    const studentRLE = localStorage.getItem('studentRLE');
                    const parsedStudentRLE = studentRLE ? JSON.parse(studentRLE) : null;
                    
                    // Fetch studentQCM from localStorage if it exists
                    const studentOLE = localStorage.getItem('studentOLE');
                    const parsedStudentOLE = studentOLE ? JSON.parse(studentOLE) : null;

                    // Prepare the payload
                    const payload = {
                        examName: exam.name,
                        module: exam.module || '',
                        niveau: exam.niveau,
                        note: totalScore,
                        school: school,
                        className: className,
                        year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`, // Dynamic year calculation
                        lastName: lastname,
                        firstName: firstname,
                        number: number,
                        parties: exam.parties,
                        studentQCM: parsedStudentQCM,
                        studentCLD: parsedStudentCLD,
                        studentCLT: parsedStudentCLT,
                        studentRPF: parsedStudentRPF,
                        studentRLV: parsedStudentRLV,
                        studentRLE: parsedStudentRLE,
                        studentOLE: parsedStudentOLE
                    };

                    // Send the data to the server
                    const response = await axios.post('/api/create-document', payload);

                    // Get the file URL from the response
                    setFileUrl(response.data.fileUrl);
                } catch (error) {
                    console.error('Error creating document:', error);
                }
            }
        };

        createDocument();
    }, [isCompleted, exam, totalScore, school, className, lastname, firstname, number]);

    useEffect(() => {
        // Check if the exam is completed and redirect on reload
        const handleBeforeUnload = (e) => {
            if (isCompleted) {
                e.preventDefault();
                navigate('/');
                return ''; // Required for some browsers
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isCompleted, navigate]);

    useEffect(() => {
        const updateExamAnswer = async () => {

            if (!fileUrl || !answerId) return;

            try {
                // Fetch the exam data
                const response = await axios.get(`/api/exam/${id}`);
                const examData = response.data;

                // Update the fileUrl within answer.userInfo for the correct answer
                const updatedAnswers = examData.answers.map(answer =>
                    answer._id === answerId
                        ? { ...answer, userInfo: { ...answer.userInfo, fileUrl: fileUrl } }
                        : answer
                );
                console.log(updatedAnswers)

                // Send the updated answers back to the server
                await axios.put(`/api/exam/${id}`, { answers: updatedAnswers });
                console.log('Exam answer updated with fileUrl successfully.');
            } catch (error) {
                console.error('Error updating exam answer with fileUrl:', error);
            }
        };

        if (fileUrl) {
            updateExamAnswer();
        }
    }, [fileUrl, id, answerId]);


    useEffect(() => {
        if (exam && Array.isArray(exam.parties)) {
            const allCLDExercises = exam.parties.flatMap(partie =>
                Array.isArray(partie.exercises)
                    ? partie.exercises.filter(exercise => exercise.type === 'CLD')
                    : []
            );

            if (allCLDExercises.length > 0) {
                const initialResponses = allCLDExercises.flatMap(exercise =>
                    exercise.data?.shuffledResponses
                        ? Array(exercise.data.shuffledResponses.length).fill('')
                        : []
                );
                setFormattedResponses(initialResponses);
            }
        }
    }, [exam]);

    const handleScoreUpdate = useCallback((type, score, points) => {
        setDetails(prevDetails => {
            const updatedDetails = { ...prevDetails };
            const existingEntry = updatedDetails[type];

            let newTotalScore;
            let newTotalPoints = Object.values(prevDetails).reduce((sum, [, points]) => sum + points, 0);

            if (existingEntry) {
                const [oldScore] = existingEntry;
                updatedDetails[type] = [score, points];
                newTotalScore = totalScore - oldScore + score;

            } else {
                updatedDetails[type] = [score, points];
                newTotalScore = totalScore + score;
            }

            // Adjust points if total points is 19
            if (newTotalPoints === 19) {
                newTotalPoints += 1;
            }



            // Update state with new values
            setTotalPoints(newTotalPoints);
            setTotalScore(newTotalScore);

            return updatedDetails;
        });
    }, [totalScore]);




    useEffect(() => {
        if (exam && exam.parties) {
            const totalExercises = exam.parties.flatMap(partie => partie.exercises).length;
            const scoredExercises = Object.keys(details).length;
            setIsCalculated(totalExercises === scoredExercises);
        }
    }, [details, exam]);

    const handleDrop = (index, event) => {
        event.preventDefault();
        const droppedItem = event.dataTransfer.getData('text/plain');
        const updatedFormattedResponses = [...formattedResponses];
        updatedFormattedResponses[index] = droppedItem;
        setFormattedResponses(updatedFormattedResponses);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const response = await axios.get(`/api/exam/${id}`);
                setExam(response.data);
            } catch (error) {
                console.error('Error fetching exam:', error);
            }
        };

        fetchExam();
    }, [id]);

    if (!exam) {
        return <p className="flex flex-col justify-center items-center m-8">Recherche de l'examen...</p>;
    }


    const { name, access, parties } = exam;

    const handleOptionChange = (partieIndex, questionId, answerIndex) => {
        setUserResponses(prevResponses => ({
            ...prevResponses,
            [`${partieIndex}-${questionId}`]: answerIndex,
        }));
    };

    const handleSubmitExam = async () => {
        setIsLoading(true);
        setFinalized(true);

        if (!isCalculated) {
            console.warn('Exam scores are not fully calculated yet.');
            setIsLoading(false);
            return;
        }

        const user = JSON.parse(localStorage.getItem('users'));
        const userInfo = {
            lastName: user[0].lastname,
            firstName: user[0].firstname,
            number: user[0].number,
            school: user[0].school,
            className: user[0].className,
            totalScore: totalScore,
            fileUrl: ''
        };

        const newAnswerId = v4();
        const newAnswer = {
            _id: newAnswerId,
            userInfo: userInfo,
        };


        try {
            // Fetch the existing exam data
            const response = await axios.get(`/api/exam/${id}`);
            const examData = response.data;

            // Append the new answer to the existing answers list
            const updatedAnswers = [...examData.answers, newAnswer];

            // Update the exam with the new answers list
            await axios.put(`/api/exam/${id}`, {
                answers: updatedAnswers,
            });

            setAnswerId(newAnswerId)


            console.log('Answers submitted successfully.');
            setIsCompleted(true);
        } catch (error) {
            console.error('Error submitting answers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center min-h-screen p-4" style={{ fontFamily: 'Times New Roman' }}>
            <div className="w-3/5">
                <h1 className="text-3xl font-bold text-gray-800 text-center">{name}</h1>

                <p>{`École : ${userRole === 'élève' ? school : Object.keys(access[0])[0]}`}</p>
                <p>{`Classe : ${userRole === 'élève' ? className : Object.values(access[0])[0]}`}</p>
                {exam.module && (
                    <p>{exam.module}</p>
                )}

                <div className="flex flex-col mt-6 p-4 rounded-xl shadow-md border-2 border-gray-300">
                    <p>1 pt est réservé à la rédaction et à la propreté de la copie</p>
                    <p className="font-bold text-sky-500 text-right">Bon courage</p>
                </div>

                {parties.map((partie, partieIndex) => (
                    <div key={partieIndex} className="mt-3 p-4 rounded-xl shadow-md border-2 border-gray-300">
                        <h2 className="text-2xl font-bold text-sky-500">{partie.name} :</h2>
                        {partie.exercises.map((exercise, exerciseIndex) => {
                            switch (exercise.type) {
                                case 'QCM':
                                    return (
                                        <ExamQCM
                                            key={exercise.index}
                                            partieIndex={partieIndex}
                                            exercise={exercise}
                                            exerciseIndex={exerciseIndex}
                                            userRole={userRole}
                                            userResponses={userResponses}
                                            handleOptionChange={handleOptionChange}
                                            finalized={finalized}
                                            onScoreUpdate={handleScoreUpdate}
                                        />
                                    );
                                case 'CLD':
                                    return (
                                        <ExamCLD
                                            key={exercise.index}
                                            exercise={exercise}
                                            exerciseIndex={exerciseIndex}
                                            formattedResponses={formattedResponses}
                                            handleDrop={handleDrop}
                                            handleDragOver={handleDragOver}
                                            isExam={true}
                                            finalized={finalized}
                                            onScoreUpdate={handleScoreUpdate}
                                        />
                                    );
                                case 'CLT':
                                    return (
                                        <ExamCLT
                                            key={exercise.index}
                                            exercise={exercise}
                                            exerciseIndex={exerciseIndex}
                                            isExam={true}
                                            finalized={finalized}
                                            onScoreUpdate={handleScoreUpdate}
                                        />
                                    );
                                case 'RPF':
                                    return (
                                        <ExamRPF
                                            key={exercise.index}
                                            exercise={exercise}
                                            exerciseIndex={exerciseIndex}
                                            isExam={true}
                                            finalized={finalized}
                                            onScoreUpdate={handleScoreUpdate}
                                        />
                                    );
                                case 'RLV':
                                    return (
                                        <ExamRLV
                                            key={exercise.index}
                                            exercise={exercise}
                                            exerciseIndex={exerciseIndex}
                                            isExam={true}
                                            finalized={finalized}
                                            onScoreUpdate={handleScoreUpdate}
                                        />
                                    );
                                case 'RLE':
                                    return (
                                        <ExamRLE
                                            key={exercise.index}
                                            exercise={exercise}
                                            exerciseIndex={exerciseIndex}
                                            isExam={true}
                                            finalized={finalized}
                                            onScoreUpdate={handleScoreUpdate}
                                        />
                                    );
                                case 'OLE':
                                    return (
                                        <ExamOLE
                                            key={exercise.index}
                                            exercise={exercise}
                                            exerciseIndex={exerciseIndex}
                                            isExam={true}
                                            finalized={finalized}
                                            onScoreUpdate={handleScoreUpdate}
                                        />
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </div>
                ))}

                {/* Certification Checkbox */}
                <div className="flex items-center my-4">
                    <input
                        type="checkbox"
                        id="certify"
                        checked={isCertified}
                        onChange={(e) => setIsCertified(e.target.checked)}
                        className="mr-2"
                    />
                    <label htmlFor="certify" className="text-lg">
                        Je certifie que toutes mes réponses sont correctes.
                    </label>
                </div>

                <div className="flex justify-center">
                    <button
                        className="w-2/5 bg-sky-500 text-white p-2 rounded-lg text-lg hover:bg-sky-600 disabled:bg-gray-400 flex items-center justify-center"
                        onClick={handleSubmitExam}
                        disabled={!isCertified || userRole === 'professeur'}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-4 border-t-2 m-2 border-white border-solid rounded-full animate-spin"></div>
                        ) : (
                            "Valider l'Examen"
                        )}
                    </button>
                </div>

                {isCompleted && <Grade score={totalScore} totalPoints={totalPoints} passingScore={totalPoints / 2} details={details} />}
            </div>
        </div>
    );
};

export default Main;
