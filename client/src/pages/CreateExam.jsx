import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/TeacherDashboard/Navbar';
import Main from '../components/TeacherDashboard/Main';

const CreateExam = () => {

  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState('');
  const id = localStorage.getItem('teacherId') || '';

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (userRole === 'professeur' && id) {
          const response = await axios.get(`/api/teacher/${id}`);
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userRole, id]);

  useEffect(() => {
    // Retrieve the role from local storage or another source
    const role = localStorage.getItem('role');
    setUserRole(role || '');
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userRole={userRole} username={username} />
      <Main />
    </div>
  );
};

export default CreateExam;
