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
            const res = await axios.post('/api/auth/register', {
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
        <div style={styles.container}>
            <div style={styles.formCard}>
                <h1 style={styles.title}>Create Account</h1>
                <p style={styles.subtitle}>Join our platform today</p>
                
                <form onSubmit={handleRegister} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    
                    {error && <div style={styles.errorBox}>{error}</div>}
                    
                    <button
                        type="submit"
                        style={styles.submitButton}
                    >
                        Create Account
                    </button>
                </form>
                
                <p style={styles.footerText}>
                    Already have an account? <a href="/login" style={styles.link}>Sign in</a>
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

export default Register;
