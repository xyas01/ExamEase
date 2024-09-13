import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ExamCard from './ExamCard';
import NoteCard from './NoteCard';
import PaperPlus from '../../assets/PaperPlus.svg';
import Filter from '../../assets/Filter.svg';
import Delete from '../../assets/Delete.svg';
import Logout from '../../assets/Logout.svg';

const Main = ({ userRole }) => {
  const [exams, setExams] = useState([]);
  const [exam, setExam] = useState(null);
  const [showExamCard, setShowExamCard] = useState(false);
  const [visibleNoteCardExamId, setVisibleNoteCardExamId] = useState(null);
  const navigate = useNavigate();
  const { id: profId } = useParams();

  const localUsers = JSON.parse(localStorage.getItem('users')) || {};
  const { school, className, lastname, firstname, number } = localUsers[0] || '';

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get('/api/exam');
        setExams(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };

    fetchExams();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleClose = () => {
    setExam(null);
    setShowExamCard(false);
    setVisibleNoteCardExamId(null); // Reset when closing the exam card
  };

  const isAccessibleToStudent = (exam) => {
    // Check if the student's information exists in the exam answers
    const hasAnswered = exam.answers.some((userInfo) => 
      (userInfo.lastName === lastname && userInfo.firstName === firstname) ||
      userInfo.number === number
    );
  
    // Check if the student has access to the exam
    const hasAccess = exam.access.some(
      (accessEntry) =>
        Object.keys(accessEntry)[0] === school &&
        Object.values(accessEntry)[0] === className
    );
  
    // Return true if the student has not answered yet and has access
    return !hasAnswered && hasAccess;
  };
  
  

  const isOwnedByProfessor = (exam) => {
    return userRole === 'professeur' && exam.creator._id === profId;
  };

  const handleViewExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const handleEditExam = (e) => {
    setExam(e);
    setShowExamCard(true);
  };

  const handleDeleteExam = async (examId) => {
    try {
      await axios.delete(`/api/exam/${examId}`);
      setExams((prevExams) => prevExams.filter((exam) => exam._id !== examId));
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  };

  const handleShowNotes = (examId) => {
    setVisibleNoteCardExamId(examId);
  };

  const handleCloseNoteCard = () => {
    setVisibleNoteCardExamId(null);
  };

  return (
    <main className="relative flex flex-col items-center h-screen overflow-hidden p-4">
      {exams.length === 0 ? (
        <p className="text-lg text-gray-700 text-center">
          Aucun examen disponible pour le moment.
        </p>
      ) : (
        <div className="w-full max-w-2xl">
          {exams.map((exam) => {
            if (
              (userRole === 'élève' && isAccessibleToStudent(exam)) ||
              (userRole === 'professeur' && isOwnedByProfessor(exam))
            ) {
              return (
                <div key={exam._id} className="border-b border-gray-200 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold" style={{ fontFamily: 'Times New Roman' }}>{exam.name}</h3>
                    {userRole === 'professeur' && (
                      <div className="flex items-center gap-2">
                        <img
                          src={Filter}
                          alt="Filter"
                          className="w-8 h-8 cursor-pointer bg-yellow-500 p-1 rounded-lg"
                          onClick={() => handleEditExam(exam)}
                        />
                        <img
                          src={Delete}
                          alt="Delete"
                          className="w-8 h-8 cursor-pointer bg-red-500 p-1 rounded-lg"
                          onClick={() => handleDeleteExam(exam._id)}
                        />
                      </div>
                    )}
                  </div>
                  <p style={{ fontFamily: 'Times New Roman' }}>
                    {`École : ${userRole === 'élève' ? school : exam.access.map(a => Object.keys(a)[0]).join(' - ')}`}
                  </p>
                  <p style={{ fontFamily: 'Times New Roman' }}>
                    {`Classe : ${userRole === 'élève' ? className : exam.access.map(a => Object.values(a)[0]).join(' - ')}`}
                  </p>

                  <div className="flex mt-4 gap-2">
                    {userRole === 'professeur' && exam.answers.length > 0 && (
                      <button
                        onClick={() => handleShowNotes(exam._id)}
                        className="bg-sky-500 text-white font-semibold py-1 px-3 rounded-lg"
                      >
                        Voir les notes
                      </button>
                    )}
                    <button
                      onClick={() => handleViewExam(exam._id)}
                      className="bg-sky-700 text-white font-semibold py-1 px-3 rounded-lg"
                    >
                      Voir l'examen
                    </button>
                  </div>
                  {visibleNoteCardExamId === exam._id && (
                    <NoteCard niveau={exam.niveau} examName={exam.name} notes={exam.answers} onClose={handleCloseNoteCard} />
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      {userRole === 'professeur' && (
        <button
          onClick={() => setShowExamCard(true)}
          className="mt-8 bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-sky-600 transition duration-300"
        >
          <img src={PaperPlus} alt="Create Exam" className="w-6 h-6" />
          Créer un nouveau examen
        </button>
      )}

      {showExamCard && <ExamCard exam={exam} profId={profId} onClose={handleClose} />}

      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center hover:opacity-80 transition duration-300"
      >
        <img src={Logout} alt="Logout" className="w-6 h-6" />
      </button>
    </main>
  );
};

export default Main;
