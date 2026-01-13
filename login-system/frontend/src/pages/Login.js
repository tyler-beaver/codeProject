/*
    Defines a login form for the React frontend 

    - Collects user input for email and password 
    - Sends a POST request to the backend '/api/auth/login' endpoint using Axios to authenticate the user 
    - Handles and displays errors returned from the backend 
    - Stores the authentication token in localStorage on successful login 
    - Uses React 'useState' hooks to manage form input and error state 
    - Prevents default form submission behavior and manages async login logic 

    This component provides an interactive interface for users to log in 
    and integrates with the backend authentication system, enabling 
    subsequent authenticated requests 
*/

// src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setToken }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post('/api/auth/login', { email, password });
            if (res && res.data && res.data.token) {
                localStorage.setItem('token', res.data.token);
                setToken(res.data.token);
                navigate('/dashboard'); // go to dashboard after login
            } else {
                setError('Login failed: no token returned.');
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        }
    };

    return (
        <form onSubmit={handleLogin} style={{ maxWidth: '400px', margin: '20px auto' }}>
            <h2>Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ display: 'block', margin: '10px 0', width: '100%', padding: '8px' }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ display: 'block', margin: '10px 0', width: '100%', padding: '8px' }}
            />
            <button
                type="submit"
                style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
                Login
            </button>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </form>
    );
}

export default Login;
