import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CloseSquare from '../../assets/CloseSquare.svg';
import axios from 'axios';

const ExamCard = ({ exam, profId, onClose }) => {
  const [examName, setExamName] = useState(exam ? exam.name : '');
  const [module, setModule] = useState(exam ? exam.module : '');
  const [niveau, setNiveau] = useState('lycee'); // New state for selecting Niveau
  const [selectedLycees, setSelectedLycees] = useState(
    exam ? exam.access.map(a => Object.keys(a)[0]) : []
  );
  const [selectedClasses, setSelectedClasses] = useState(
    exam ? exam.access.reduce((acc, curr) => {
      const lycee = Object.keys(curr)[0];
      const cls = Object.values(curr)[0];
      acc[lycee] = acc[lycee] ? [...acc[lycee], cls] : [cls];
      return acc;
    }, {}) : {}
  );
  const [lycees, setLycees] = useState([]); // Fetch schools from MongoDB
  const [newSchool, setNewSchool] = useState('');
  const [newClass, setNewClass] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get(`/api/teacher/${profId}/schools`);
        setLycees(response.data.schools);
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
    };

    fetchSchools();
  }, [profId]);

  const handleLyceeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedLycees([...selectedLycees, value]);
    } else {
      setSelectedLycees(selectedLycees.filter((lycee) => lycee !== value));
      setSelectedClasses((prevClasses) => {
        const updatedClasses = { ...prevClasses };
        delete updatedClasses[value];
        return updatedClasses;
      });
    }
  };

  const handleClassChange = (lycee, e) => {
    const { value, checked } = e.target;
    setSelectedClasses((prevClasses) => {
      const updatedClasses = { ...prevClasses };
      if (checked) {
        if (!updatedClasses[lycee]) {
          updatedClasses[lycee] = [];
        }
        updatedClasses[lycee].push(value);
      } else {
        updatedClasses[lycee] = updatedClasses[lycee].filter((cls) => cls !== value);
      }
      return updatedClasses;
    });
  };

  const handleAddSchool = async () => {
    try {
      await axios.post(`/api/teacher/${profId}/schools`, { school: newSchool });
      setLycees([...lycees, { school: newSchool, classes: [] }]);
      setNewSchool('');
    } catch (error) {
      console.error('Error adding school:', error);
    }
  };

  const handleAddClass = async (lycee) => {
    try {
      await axios.put(`/api/teacher/${profId}/schools/${lycee}`, { className: newClass });
      setSelectedClasses((prevClasses) => ({
        ...prevClasses,
        [lycee]: [...(prevClasses[lycee] || []), newClass]
      }));
      setNewClass('');
    } catch (error) {
      console.error('Error adding class:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const access = selectedLycees.flatMap((lycee) => (
      selectedClasses[lycee]?.map((cls) => ({ [lycee]: cls })) || []
    ));

    try {
      if (exam) {
        const response = await axios.put(`/api/exam/${exam._id}`, { name: examName, module, access });
        if (response.status === 200) {
          alert("Examen modifié avec succès");
          onClose();
        }
      } else {
        const response = await axios.post('/api/exam', {
          name: examName,
          module,
          creator: localStorage.getItem('teacherId'),
          access,
        });
        if (response.data && response.data.examId) {
          navigate(`/createexam/${response.data.examId}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg max-h-[80%] w-full relative overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4">
          <img src={CloseSquare} alt="Close" className="w-6 h-6 cursor-pointer hover:opacity-80" />
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center">{exam ? 'Modifier l\'examen' : 'Créer un nouvel examen'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Nom de l'examen</label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Niveau selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Niveau</label>
            <div className="flex gap-8 items-center">
              <label>
                <input
                  type="radio"
                  name="niveau"
                  value="lycee"
                  className='mr-2'
                  checked={niveau === 'lycee'}
                  onChange={() => setNiveau('lycee')}
                />
                Lycée
              </label>
              <label>
                <input
                  type="radio"
                  name="niveau"
                  value="college"
                  className='mr-2'
                  checked={niveau === 'college'}
                  onChange={() => setNiveau('college')}
                />
                Collège
              </label>
            </div>
          </div>

          {/* Module or Unité */}
          <div className="mb-4">
            <div className='flex gap-1 items-center mb-2'>
              <label className="block text-gray-700 font-medium">
                {niveau === 'lycee' ? 'Module' : 'Unité'}
              </label>
              <p className='text-gray-400 text-xs'>(Commencer par {niveau === 'lycee' ? 'Module' : 'Unité'} n&#176; : )</p>
            </div>
            <input
              type="text"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Rest of the form */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Ajouter un lycée</label>
            <div className='w-full flex gap-2'>
              <input
                type="text"
                value={newSchool}
                onChange={(e) => setNewSchool(e.target.value)}
                className="w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={handleAddSchool}
                className="w-1/3 bg-sky-500 text-white py-1 px-2 rounded-lg hover:bg-sky-600"
              >
                Ajouter Lycée
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Lycées disponibles</label>
            {lycees.map((lycee) => (
              <div key={lycee.school} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  value={lycee.school}
                  checked={selectedLycees.includes(lycee.school)}
                  onChange={handleLyceeChange}
                  className="mr-2"
                />
                <label className="text-gray-700">{lycee.school}</label>
              </div>
            ))}
          </div>

          {selectedLycees.map((lycee) => (
            <div key={lycee} className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Ajouter une classe pour {lycee}</label>
              <div className='w-full flex gap-2'>
                <input
                  type="text"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddClass(lycee)}
                  className="w-1/3 bg-green-500 text-white py-1 px-2 rounded-lg hover:bg-green-600"
                >
                  Ajouter Classe
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-2">Classes pour {lycee}</label>
                {lycees.find(s => s.school === lycee)?.classes.map((cls) => (
                  <div key={cls} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      value={cls}
                      checked={selectedClasses[lycee]?.includes(cls)}
                      onChange={(e) => handleClassChange(lycee, e)}
                      className="mr-2"
                    />
                    <label className="text-gray-700">{cls}</label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600"
          >
            {exam ? 'Modifier' : 'Créer'} l'Examen
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExamCard;
