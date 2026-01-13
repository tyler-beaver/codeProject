/**
    Defines a registration form for the React frontend

    - Collects user input for username, email, and password 
    - Sends a Post request to the backend '/api/auth/register' endpoint using Axios to create a new user 
    - Handles and displays errors returned from the backend 
    - Uses React 'useState' hooks to manage form inputs and error state 
    - Prevents default form submission behavior and manages async registration logic

    This component provides a simple, interactive interface for new users 
    to create an account and integrates with the backend authentication system 
*/

import React, { useState } from 'react';
import axios from 'axios'; 

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password}); 
            console.log('User registered:', res.date); 
            setError('');
        } catch (err) {
            console.error(err.response.data);
            setError(err.response.data.error); 
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <input tyupe="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit">Register</button>
            {error && <p>{error}</p>}
        </form>
    );
}

export default Register; 

