import React, { useState, useMemo } from 'react';
import Swap from '../../assets/Swap.svg';

const NoteCard = ({ exam, notes, niveau, examName, onClose }) => {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'number', direction: 'asc' });
  const [isPDFLoading, setIsPDFLoading] = useState(false);
  const [isEXCELLoading, setIsEXCELLoading] = useState(false);

  // Extract unique schools
  const schools = [...new Set(notes.map(note => note.userInfo.school))];

  // Extract unique classes for the selected school
  const classes = useMemo(() => {
    if (!selectedSchool) return [];
    return [
      ...new Set(
        notes
          .filter(note => note.userInfo.school === selectedSchool)
          .map(note => note.userInfo.className)
      )
    ];
  }, [selectedSchool, notes]);

  // Filter notes based on selected school and class
  const filteredUsers = useMemo(() => {
    return notes
      .filter(note => (!selectedSchool || note.userInfo.school === selectedSchool) && (!selectedClass || note.userInfo.className === selectedClass));
  }, [selectedSchool, selectedClass, notes]);

  // Sorting function
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a.userInfo[sortConfig.key];
        const bValue = b.userInfo[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredUsers, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDownloadPDFs = async () => {
    setIsPDFLoading(true);
    try {
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          niveau,
          examName,
          school: selectedSchool,
          class: selectedClass,
        }),
      });

      if (response.ok) {
        // Get the filename from the Content-Disposition header
        const disposition = response.headers.get('Content-Disposition');
        const filename = disposition?.match(/filename="([^"]*)"/)?.[1] || 'files.zip';

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // Use the filename from the header
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error('Failed to download files');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    } finally {
      setIsPDFLoading(false);
    }
  };

  const handleCreateAndDownload = async () => {
    setIsEXCELLoading(true);
    try {
      const payload = {
        examName: exam.name,
        module: exam.module || '',
        niveau: exam.niveau,
        notes: notes,
        access: exam.access,
        year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`, // Dynamic year calculation
        selectedSchool: selectedSchool,
        selectedClass: selectedClass
      };

      const response = await fetch('http://localhost:5000/api/create-and-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const disposition = response.headers.get('Content-Disposition');
        const filename = disposition?.match(/filename="([^"]*)"/)?.[1];

        if (selectedSchool && selectedClass) {
          const fileUrl = await response.text();
          window.location.href = fileUrl;
        } else {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      } else {
        console.error('Failed to download files');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    } finally {
      setIsEXCELLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col border border-sky-500 mt-4 bg-white px-6 py-3 rounded-lg shadow-lg">
      <div className="flex gap-2 mb-4">
        {schools.map((school, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedSchool(school);
              setSelectedClass(null); // Reset class selection when changing school
            }}
            className={`px-4 py-2 rounded-lg ${selectedSchool === school ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {school}
          </button>
        ))}
      </div>

      {selectedSchool && (
        <div className="flex gap-2 mb-4">
          {classes.map((className, index) => (
            <button
              key={index}
              onClick={() => setSelectedClass(className)}
              className={`px-4 py-2 rounded-lg ${selectedClass === className ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {className}
            </button>
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">
        {selectedSchool
          ? (selectedClass
            ? selectedClass
            : 'Toutes les Classes')
          : 'Toutes les Ecoles'
        }
      </h2>
      <div className="grid grid-cols-4 font-semibold mb-2 gap-2 px-2 py-1 border border-gray-300 rounded-md" style={{ gridTemplateColumns: '20% 40% 20% 20%' }}>
        <div className="flex justify-between items-center">
          <span>Numero</span>
          <img
            src={Swap}
            alt="Swap"
            className="w-4 h-4 cursor-pointer"
            onClick={() => handleSort('number')}
          />
        </div>
        <div className="flex justify-between items-center">
          <span>Nom et Prenom</span>
          <img
            src={Swap}
            alt="Swap"
            className="w-4 h-4 cursor-pointer"
            onClick={() => handleSort('lastName')}
          />
        </div>
        <div className="flex justify-between items-center">
          <span>Note</span>
          <img
            src={Swap}
            alt="Swap"
            className="w-4 h-4 cursor-pointer"
            onClick={() => handleSort('totalScore')}
          />
        </div>
        <div className="flex justify-between items-center">
          <span>Copie PDF</span>
        </div>
      </div>

      <div className="gap-2 px-2 py-1 border border-gray-300 rounded-md">
        {sortedUsers.map(user => (
          <div key={user.userInfo._id} className="grid grid-cols-4 gap-2 border-b pb-2" style={{ gridTemplateColumns: '20% 40% 20% 20%' }}>
            <span>{user.userInfo.number}</span>
            <span>{`${user.userInfo.lastName} ${user.userInfo.firstName}`}</span>
            <span className="font-semibold">{`${user.userInfo.totalScore} pts`}</span>
            <a href={user.userInfo.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Voir PDF</a>
          </div>
        ))}
      </div>

      <div className='w-full flex gap-4'>
        <button
          onClick={handleDownloadPDFs}
          className={`w-1/2 mt-4 ${isPDFLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500'} text-white px-4 py-2 rounded-lg`}
          disabled={isPDFLoading} // Disable button while loading
        >
          {isPDFLoading ? 'Téléchargement en cours...' : 'Télécharger zip (PDF)'}
        </button>
        <button
          onClick={handleCreateAndDownload}
          className={`w-1/2 mt-4 ${isEXCELLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500'} text-white px-4 py-2 rounded-lg`}
          disabled={isEXCELLoading} // Disable button while loading
        >
          {isEXCELLoading ? 'Téléchargement en cours...' : 'Télécharger zip (EXCEL)'}
        </button>
      </div>

      <button
        onClick={onClose}
        className="absolute top-2 right-2 border border-black text-black px-2 py-1 rounded-lg flex items-center"
      >
        &#10005;
      </button>
    </div>
  );
};

export default NoteCard;
