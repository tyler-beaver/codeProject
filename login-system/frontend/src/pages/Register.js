/**
 * Registration form for the React frontend
 *
 * - Collects username, email, and password
 * - Sends a POST request to the backend '/api/auth/register' endpoint using Axios
 * - Handles errors safely and displays them
 * - Uses React useState hooks to manage input values and error state
 */

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                email,
                password,
            });

            if (res && res.data) {
                console.log('User registered:', res.data);
                navigate('/login'); 
            } else {
                setError('Registration failed: no response data from server.');
            }
        } catch (err) {
            console.error('Axios error:', err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('An unknown error occurred during registration.');
            }
        }
    };

    return (
        <form onSubmit={handleRegister} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2>Register</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ display: 'block', margin: '10px 0', width: '100%', padding: '8px' }}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ display: 'block', margin: '10px 0', width: '100%', padding: '8px' }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ display: 'block', margin: '10px 0', width: '100%', padding: '8px' }}
            />
            <button
                type="submit"
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                Register
            </button>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </form>
    );
}

export default Register;
