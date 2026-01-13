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

import React, { useState } from 'react';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            console.log('Login successful:', res.data);
            setError('');
            localStorage.setItem('token', res.data.token);
        } catch (err) {
            console.error(err.response.data);
            setError(err.response.data.error);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit">Login</button>
            {error && <p>{error}</p>}
        </form>
    );
}

export default Login; 
