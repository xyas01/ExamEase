import React, { useEffect, useState } from 'react';
import Navbar from '../components/Home/Navbar';
import Main from '../components/Home/Main';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Home = () => {
  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState('');
  const { id } = useParams(); // Extract user ID from URL

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (userRole === 'professeur' && id) {
          const response = await axios.get(`/api/teacher/${id}`);
          setUsername(response.data.username);
        } else {
          // For student role, fetch from local storage
          const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
          const student = storedUsers.find(user => user.role === 'élève' && user.username);
          if (student) {
            setUsername(student.username);
          }
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
    <div>
      <Navbar userRole={userRole} username={username} />
      <Main userRole={userRole} />
    </div>
  );
};

export default Home;
