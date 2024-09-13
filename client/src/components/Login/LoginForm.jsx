import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm = ({ role }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [number, setNumber] = useState('');
  const [school, setSchool] = useState('');
  const [className, setClassName] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch schools from the server
    const fetchSchools = async () => {
      try {
        const profId = '66ddcbdcedfdb4607597b0ed'; // Adjust as needed
        const response = await axios.get(`/api/teacher/${profId}/schools`);
        setSchools(response.data.schools);
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
    };

    fetchSchools();
  }, []);

  useEffect(() => {
    if (school) {
      const selectedSchool = schools.find(s => s.school === school);
      setAvailableClasses(selectedSchool ? selectedSchool.classes : []);
      setClassName(''); // Reset class selection when school changes
    }
  }, [school, schools]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (role === 'professeur') {
      try {
        const response = await axios.post('/api/login', {
          username: username.toUpperCase(),
          password,
        });

        if (response.data.status === 'success') {
          const teacherId = response.data.id; // Extract teacher ID
          localStorage.setItem('role', 'professeur');
          localStorage.setItem('teacherId', teacherId); // Store teacher ID
          navigate(`/${teacherId}`); // Redirect with teacher ID
        } else {
          alert(response.data.message || 'Erreur lors de la connexion');
        }
      } catch (error) {
        alert('Nom d’utilisateur ou mot de passe incorrect');
      }
    } else {
      // Retrieve stored users from local storage
      const storedUsers = JSON.parse(localStorage.getItem('users')) || [];

      // Create the uppercase username from student details
      const studentUsername = `${lastname.toUpperCase()} ${firstname.charAt(0).toUpperCase() + firstname.slice(1).toLowerCase()}`;

      // Check if the user already exists
      const userExists = storedUsers.some(user => 
        user.role === role && user.username === studentUsername
      );

      if (userExists) {
        alert('L’utilisateur existe déjà');
      } else {
        // Add new user to local storage
        const newUser = {
          role:'élève',
          username: studentUsername,
          password,
          firstname: firstname.charAt(0).toUpperCase() + firstname.slice(1).toLowerCase(),
          lastname: lastname.toUpperCase(),
          number,
          school,
          className,
        };
        storedUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(storedUsers));

        // Store role locally
        localStorage.setItem('role', 'élève');

        // Redirect to the student's dashboard
        navigate(`/${lastname.toUpperCase()}${firstname.toUpperCase()}`);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-1/3 border-4 border-black rounded-2xl p-8 flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-6">
          {role === 'professeur' ? 'Connexion Professeur' : 'Connexion Élève'}
        </h2>
        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          {role === 'professeur' ? (
            <>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-sky-500">Prof.</span>
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="p-3 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button type="submit" className="bg-sky-500 text-white font-semibold py-3 rounded-lg hover:bg-sky-800 transition duration-300">
                Connexion
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Prénom"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="text"
                placeholder="Nom"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="text"
                placeholder="Numéro"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Sélectionnez un lycée</option>
                {schools.map(({ school }) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled={!school} // Disable class selection until a school is chosen
              >
                <option value="">Sélectionnez une classe</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
              <button type="submit" className="bg-sky-500 text-white font-semibold py-3 rounded-lg hover:bg-sky-800 transition duration-300">
                Connexion
              </button>
            </>
          )}
        </form>
        {role === 'professeur' && (
          <p className="mt-4 text-sm text-gray-700">
            Vous êtes un nouveau professeur? <a href="/signup" className="text-sky-500 underline">Inscrivez-vous ici</a>.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
