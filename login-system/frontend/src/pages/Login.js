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
        <div style={styles.container}>
            <div style={styles.formCard}>
                <h1 style={styles.title}>Welcome Back</h1>
                <p style={styles.subtitle}>Sign in to your account</p>
                
                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    
                    {error && <div style={styles.errorBox}>{error}</div>}
                    
                    <button
                        type="submit"
                        style={styles.submitButton}
                    >
                        Sign In
                    </button>
                </form>
                
                <p style={styles.footerText}>
                    Don't have an account? <a href="/register" style={styles.link}>Create one</a>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 60px)',
        background: 'linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)',
        padding: '20px',
    },
    formCard: {
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        padding: '60px 50px',
        maxWidth: '450px',
        width: '100%',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 700,
        color: '#000000',
        margin: '0 0 8px 0',
    },
    subtitle: {
        fontSize: '0.95rem',
        color: '#65676b',
        margin: '0 0 32px 0',
    },
    form: {
        marginBottom: '24px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#000000',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '12px 14px',
        fontSize: '1rem',
        border: '1px solid #cce7ff',
        borderRadius: '6px',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        transition: 'border-color 0.3s ease',
        outline: 'none',
    },
    errorBox: {
        background: '#fee',
        border: '1px solid #fcc',
        color: '#d32f2f',
        padding: '12px 14px',
        borderRadius: '6px',
        marginBottom: '20px',
        fontSize: '0.9rem',
    },
    submitButton: {
        width: '100%',
        padding: '12px 20px',
        fontSize: '1rem',
        fontWeight: 600,
        background: '#0a66c2',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    footerText: {
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#65676b',
        margin: 0,
    },
    link: {
        color: '#0a66c2',
        textDecoration: 'none',
        fontWeight: 600,
        cursor: 'pointer',
    },
};

export default Login;
