import React from 'react';
import Profile from '../../assets/Profile.svg'; // Adjust path if necessary

const Navbar = ({ userRole, username }) => {
  return (
    <div className="flex justify-center items-center bg-white border-b border-gray-300 p-4">
      <div className="flex-grow flex w-1/3 justify-center gap-96">
        <div className="text-sky-500 text-2xl font-bold">
          ExamEase
        </div>
        <div className="flex justify-end items-center gap-4">
          <img
            src={Profile}
            alt="Profile"
            className="w-10 h-10 rounded-xl border-2 border-black bg-gray-200"
          />
          <span className="text-lg font-semibold">
            {userRole === 'professeur' ? `Prof. ${username}` : `Élève ${username}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
