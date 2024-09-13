import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        const uppercaseUsername = username.toUpperCase()

        try {
            await axios.post('/api/signup', {
                username: uppercaseUsername,
                password,
            });

            navigate('/login');
        } catch (error) {
            alert('Erreur lors de l’inscription');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-1/3 border-4 border-black rounded-2xl p-8 flex flex-col items-center">
                <h2 className="text-2xl font-semibold mb-6">Inscription</h2>
                <form className="w-full flex flex-col gap-4" onSubmit={handleSignup}>
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
                        S'inscrire
                    </button>
                </form>
                <p className="mt-4 text-sm text-gray-700">
                    Vous avez déjà un compte? <a href="/login" className="text-sky-500 underline">Connectez-vous ici</a>.
                </p>
            </div>
        </div>
    );
};

export default Signup;
