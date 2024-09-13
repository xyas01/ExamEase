import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ToolsMenu from './ToolsMenu';
import { useParams } from 'react-router-dom';
import Partie from '../Exercises/Partie';

const toRoman = (num) => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return romanNumerals[num] || num;
};

const Main = () => {
  const [exercises, setExercises] = useState([]);
  const [currentPhaseId, setCurrentPhaseId] = useState(null);
  const [showQCMForm, setShowQCMForm] = useState(false);
  const [showCLDForm, setShowCLDForm] = useState(false);
  const [showCLTForm, setShowCLTForm] = useState(false);
  const [showRPFForm, setShowRPFForm] = useState(false);
  const [showRLVForm, setShowRLVForm] = useState(false);
  const [showRLEForm, setShowRLEForm] = useState(false);
  const [showOLEForm, setShowOLEForm] = useState(false);
  const { id: examId } = useParams();

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await axios.get(`/api/exam/${examId}`);
        setExercises(response.data.parties || []);
      } catch (error) {
        console.error('Error fetching exam data:', error);
      }
    };
    fetchExamData();
  }, [examId]);

  const handleAddPhase = () => {
    setExercises(prevExercises => [
      ...prevExercises,
      { id: Date.now(), name: `Partie ${prevExercises.length + 1}`, exercises: [] }
    ]);
  };

  const handleShowQCMForm = () => {
    const phaseId = exercises.length > 0 ? exercises[exercises.length - 1].id : null;
    if (phaseId) {
      setCurrentPhaseId(phaseId);
      setShowQCMForm(true);
    }
  };

  const handleShowCLDForm = () => {
    const phaseId = exercises.length > 0 ? exercises[exercises.length - 1].id : null;
    if (phaseId) {
      setCurrentPhaseId(phaseId);
      setShowCLDForm(true);
    }
  };

  const handleShowCLTForm = () => {
    const phaseId = exercises.length > 0 ? exercises[exercises.length - 1].id : null;
    if (phaseId) {
      setCurrentPhaseId(phaseId);
      setShowCLTForm(true);
    }
  };

  const handleShowRPFForm = () => {
    const phaseId = exercises.length > 0 ? exercises[exercises.length - 1].id : null;
    if (phaseId) {
      setCurrentPhaseId(phaseId);
      setShowRPFForm(true);
    }
  };

  const handleShowRLVForm = () => {
    const phaseId = exercises.length > 0 ? exercises[exercises.length - 1].id : null;
    if (phaseId) {
      setCurrentPhaseId(phaseId);
      setShowRLVForm(true);
    }
  };

  const handleShowRLEForm = () => { // New method to show RLE form
    const phaseId = exercises.length > 0 ? exercises[exercises.length - 1].id : null;
    if (phaseId) {
      setCurrentPhaseId(phaseId);
      setShowRLEForm(true);
    }
  };

  const handleShowOLEForm = () => { // New method to show OLE form
    const phaseId = exercises.length > 0 ? exercises[exercises.length - 1].id : null;
    if (phaseId) {
      setCurrentPhaseId(phaseId);
      setShowOLEForm(true);
    }
  };

  const handleQCMSubmit = (qcmData) => {
    const newQCM = {
      id: Date.now(),
      type: 'QCM',
      points: qcmData.totalPoints,
      questions: qcmData.questions.map((question, index) => ({
        id: Date.now() + index,
        question: question.question,
        answers: question.answers,
        correctAnswer: question.correctAnswer
      })),
    };

    setExercises(prevExercises =>
      prevExercises.map(exercise =>
        exercise.id === currentPhaseId
          ? { ...exercise, exercises: [...exercise.exercises, newQCM] }
          : exercise
      )
    );

    setShowQCMForm(false);
    setCurrentPhaseId(null);
  };

  const handleCLDSubmit = (cldData) => {
    const newCLD = {
      id: Date.now(),
      type: 'CLD',
      points: cldData.totalPoints,
      responses: cldData.responses,
      shuffledResponses: cldData.shuffledResponses,
      image: cldData.image
    };

    setExercises(prevExercises =>
      prevExercises.map(exercise =>
        exercise.id === currentPhaseId
          ? { ...exercise, exercises: [...exercise.exercises, newCLD] }
          : exercise
      )
    );

    setShowCLDForm(false);
    setCurrentPhaseId(null);
  };

  const handleCLTSubmit = (cltData) => {
    const newCLT = {
      id: Date.now(),
      type: 'CLT',
      points: cltData.totalPoints,
      words: cltData.words,
      shuffledWords: cltData.shuffledWords,
      columnNames: cltData.columnNames,
      correctAnswers: cltData.correctAnswers
    };

    setExercises(prevExercises =>
      prevExercises.map(exercise =>
        exercise.id === currentPhaseId
          ? { ...exercise, exercises: [...exercise.exercises, newCLT] }
          : exercise
      )
    );

    setShowCLTForm(false);
    setCurrentPhaseId(null);
  };

  const handleRPFSubmit = (rpfData) => {
    const newRPF = {
      id: Date.now(),
      type: 'RPF',
      points: rpfData.totalPoints,
      textLeft: rpfData.textLeft,
      textRight: rpfData.textRight,
      correctAnswers: rpfData.correctAnswers
    };

    setExercises(prevExercises =>
      prevExercises.map(exercise =>
        exercise.id === currentPhaseId
          ? { ...exercise, exercises: [...exercise.exercises, newRPF] }
          : exercise
      )
    );

    setShowRPFForm(false);
    setCurrentPhaseId(null);
  };

  const handleRLVSubmit = (rlvData) => {
    const newRLV = {
      id: Date.now(),
      type: 'RLV',
      points: rlvData.totalPoints,
      shuffledWords: rlvData.shuffledWords,
      phrases: rlvData.formattedPhrases,
      correctAnswers: rlvData.correctAnswers
    };

    setExercises(prevExercises =>
      prevExercises.map(exercise =>
        exercise.id === currentPhaseId
          ? { ...exercise, exercises: [...exercise.exercises, newRLV] }
          : exercise
      )
    );

    setShowRLVForm(false);
    setCurrentPhaseId(null);
  };

  const handleRLESubmit = (rleData) => { // New method to handle RLE form submission
    const newRLE = {
      id: Date.now(),
      type: 'RLE',
      points: rleData.totalPoints,
      text: rleData.text,
      correctAnswers: rleData.correctAnswers
    };

    setExercises(prevExercises =>
      prevExercises.map(exercise =>
        exercise.id === currentPhaseId
          ? { ...exercise, exercises: [...exercise.exercises, newRLE] }
          : exercise
      )
    );

    setShowRLEForm(false);
    setCurrentPhaseId(null);
  };

  const handleOLESubmit = (oleData) => { // New method to handle OLE form submission
    const newOLE = {
      id: Date.now(),
      type: 'OLE',
      points: oleData.totalPoints,
      questions: oleData.questions
    };

    setExercises(prevExercises =>
      prevExercises.map(exercise =>
        exercise.id === currentPhaseId
          ? { ...exercise, exercises: [...exercise.exercises, newOLE] }
          : exercise
      )
    );

    setShowOLEForm(false);
    setCurrentPhaseId(null);
  };

  const handleCompleteExam = async () => {
    try {
      const formattedExercises = exercises.map((exercise, index) => ({
        name: `Partie ${toRoman(index)}`,
        exercises: exercise.exercises.map(ex => ({
          type: ex.type,
          data: ex.type === 'QCM' ? {
            id: ex.id,
            points: ex.points,
            questions: ex.questions
          } : ex.type === 'CLD' ? {
            id: ex.id,
            points: ex.points,
            responses: ex.responses,
            shuffledResponses: ex.shuffledResponses,
            image: ex.image
          } : ex.type === 'CLT' ? {
            id: ex.id,
            points: ex.points,
            words: ex.words,
            shuffledWords: ex.shuffledWords,
            columnNames: ex.columnNames,
            correctAnswers: ex.correctAnswers
          } : ex.type === 'RPF' ? {
            id: ex.id,
            points: ex.points,
            textLeft: ex.textLeft,
            textRight: ex.textRight,
            correctAnswers: ex.correctAnswers
          } : ex.type === 'RLV' ? {
            id: ex.id,
            points: ex.points,
            shuffledWords: ex.shuffledWords,
            phrases: ex.phrases,
            correctAnswers: ex.correctAnswers
          } : ex.type === 'RLE' ? {
            id: ex.id,
            points: ex.points,
            text: ex.text,
            correctAnswers: ex.correctAnswers
          } : ex.type === 'OLE' ? {
            id: ex.id,
            points: ex.points,
            questions: ex.questions
          } : {}
        })),
        _id: exercise._id || null,
      }));

      await axios.put(`/api/exam/${examId}`, {
        parties: formattedExercises
      });
      alert('Exam updated successfully!');
    } catch (error) {
      console.error('Error updating exam:', error);
      alert('Failed to update the exam.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex">
        <div className="w-1/5 p-4 border-r border-gray-300">
          <ToolsMenu
            onAddPhase={handleAddPhase}
            onAddQCM={handleShowQCMForm}
            onAddCLD={handleShowCLDForm}
            onAddCLT={handleShowCLTForm}
            onAddRPF={handleShowRPFForm}
            onAddRLV={handleShowRLVForm}
            onAddRLE={handleShowRLEForm}
            onAddOLE={handleShowOLEForm}
            canAddQCM={exercises.length > 0}
          />
        </div>
        <main className="w-3/5 p-4">
          {exercises.length === 0 ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Créer un exercice</h2>
            </div>
          ) : (
            exercises.map((exercise, index) => (
              <Partie
                key={exercise.id}
                id={index}
                name={`Partie ${toRoman(index)}`}
                exercises={exercise.exercises}
                showQCMForm={currentPhaseId === exercise.id && showQCMForm}
                showCLDForm={currentPhaseId === exercise.id && showCLDForm}
                showCLTForm={currentPhaseId === exercise.id && showCLTForm}
                showRPFForm={currentPhaseId === exercise.id && showRPFForm}
                showRLVForm={currentPhaseId === exercise.id && showRLVForm}
                showRLEForm={currentPhaseId === exercise.id && showRLEForm}
                showOLEForm={currentPhaseId === exercise.id && showOLEForm}
                onQCMSubmit={handleQCMSubmit}
                onCLDSubmit={handleCLDSubmit}
                onCLTSubmit={handleCLTSubmit}
                onRPFSubmit={handleRPFSubmit}
                onRLVSubmit={handleRLVSubmit}
                onRLESubmit={handleRLESubmit}
                onOLESubmit={handleOLESubmit}
              />
            ))
          )}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleCompleteExam}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
            >
              Terminer l'examen
            </button>
          </div>
        </main>
        <div className="w-1/5 p-4"></div>
      </div>
    </div>
  );
};

export default Main;
