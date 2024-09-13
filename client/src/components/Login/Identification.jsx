import React, { useState } from 'react';
import Profile from '../../assets/Profile.svg';
import LoginForm from './LoginForm';

const Identification = () => {
  const [role, setRole] = useState(null);

  if (role) {
    return <LoginForm role={role} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-1/3 border-4 border-black rounded-2xl p-8 flex flex-col items-center">
        <p className="text-xl font-semibold mb-6">Choisir votre rôle :</p>
        <div className="grid grid-cols-2 gap-8">
          <div
            onClick={() => setRole('professeur')}
            className="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-sky-300 transition duration-300"
          >
            <img src={Profile} alt="Profile" className="w-24 h-24 mb-2" />
            <p>Professeur</p>
          </div>
          <div
            onClick={() => setRole('eleve')}
            className="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-sky-300 transition duration-300"
          >
            <img src={Profile} alt="Profile" className="w-24 h-24 mb-2" />
            <p>Élève</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Identification;
