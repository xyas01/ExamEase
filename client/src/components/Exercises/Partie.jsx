import React, { useState, useEffect } from 'react';
import QCM from './QCM';
import CLD from './CLD';
import CLT from './CLT';
import RPF from './RPF';
import RLV from './RLV';
import RLE from './RLE';
import OLE from './OLE';
import ExamQCM from '../Exam/ExamQCM';
import ExamCLD from '../Exam/ExamCLD';
import ExamCLT from '../Exam/ExamCLT';
import ExamRPF from '../Exam/ExamRPF';
import ExamRLV from '../Exam/ExamRLV';
import ExamRLE from '../Exam/ExamRLE';
import ExamOLE from '../Exam/ExamOLE';

const Partie = ({
  id, name, exercises, showQCMForm, showCLDForm, showCLTForm, showRPFForm, showRLVForm, showRLEForm, showOLEForm,
  onQCMSubmit, onCLDSubmit, onCLTSubmit, onRPFSubmit, onRLVSubmit, onRLESubmit, onOLESubmit
}) => {
  const [formattedResponses, setFormattedResponses] = useState([]);

  useEffect(() => {
    // Initialize formatted responses based on the number of shuffled responses in the first CLD exercise
    const initialResponses = exercises
      .filter(exercise => exercise.type === 'CLD')
      .flatMap(exercise => Array(exercise.shuffledResponses.length).fill(''));
    setFormattedResponses(initialResponses);
  }, [exercises]);

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

  return (
    <div className="mb-4 p-4 border border-sky-500 rounded-xl" style={{ fontFamily: 'Times New Roman' }}>
      <h3 className="text-lg font-semibold">{name} :</h3>

      {exercises.map((exercise, exerciseIndex) => (
        <div key={exercise.id} className="mt-4 p-4 border border-gray-300 rounded-xl">
          {exercise.type === 'QCM' && (
            <ExamQCM
              exercise={exercise}
              exerciseIndex={exerciseIndex}
            />
          )}

          {exercise.type === 'CLD' && (
            <ExamCLD
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              formattedResponses={formattedResponses}
              handleDrop={handleDrop}
              handleDragOver={handleDragOver}
              isExam={false}
            />
          )}

          {exercise.type === 'CLT' && (
            <ExamCLT
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              isExam={false}
            />
          )}

          {exercise.type === 'RPF' && (
            <ExamRPF
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              isExam={false}
            />
          )}

          {exercise.type === 'RLV' && (
            <ExamRLV
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              isExam={false}
            />
          )}

          {exercise.type === 'RLE' && (
            <ExamRLE
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              isExam={false}
            />
          )}
          {exercise.type === 'OLE' && (
            <ExamOLE
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              isExam={false}
            />
          )}
        </div>
      ))}

      {showQCMForm && (
        <QCM
          onSubmitQCM={onQCMSubmit}
          initialNumberOfQuestions={0}
          initialNumberOfAnswers={2}
        />
      )}

      {showCLDForm && (
        <CLD
          onSubmitCLD={onCLDSubmit}
        />
      )}

      {showCLTForm && (
        <CLT
          onSubmitCLT={onCLTSubmit}
        />
      )}

      {showRPFForm && (
        <RPF
          onSubmitRPF={onRPFSubmit}
        />
      )}

      {showRLVForm && (
        <RLV
          onSubmitRLV={onRLVSubmit}
        />
      )}

      {showRLEForm && (
        <RLE
          onSubmitRLE={onRLESubmit}
        />
      )}
      {showOLEForm && (
        <OLE
          onSubmitOLE={onOLESubmit}
        />
      )}
    </div>
  );
};

export default Partie;
