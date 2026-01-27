/**
 * Registration form for the React frontend
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
                navigate('/login'); 
            } else {
                setError('Registration failed: no response data from server.');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Error creating account. Please try again.');
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.leftPanel}>
                <div style={styles.imageBg}>
                    <div style={styles.brandSection}>
                        <div style={styles.brandIcon}>📝</div>
                        <h2 style={styles.brandName}>JobTracker</h2>
                        <p style={styles.brandDesc}>Start tracking your dream jobs.</p>
                        <div style={{marginTop: 32}}>
                            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="10" y="20" width="100" height="40" rx="10" fill="#3b82f6" opacity="0.12" />
                                <rect x="25" y="35" width="70" height="10" rx="5" fill="#3b82f6" opacity="0.18" />
                            </svg>
                        </div>
                    </div>
                    <div style={styles.overlayCard}>
                        <h1 style={styles.title}>Create Account</h1>
                        <p style={styles.subtitle}>Join a growing community of job seekers.</p>
                        <form onSubmit={handleRegister} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
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
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            {error && <div style={styles.errorBox}>{error}</div>}
                            <button type="submit" style={styles.button} onMouseEnter={e => e.target.style.background = '#2563eb'} onMouseLeave={e => e.target.style.background = '#3b82f6'}>
                                Create Account
                            </button>
                        </form>
                        <p style={styles.footer}>
                            Already have an account? <a href="/login" style={styles.link}>Sign in</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        minHeight: 'calc(100vh - 64px)',
        background: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    },
    leftPanel: {
        flex: 1,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minWidth: '320px',
        overflow: 'hidden',
    },
    imageBg: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    overlayCard: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 8px 32px 0 rgba(59,130,246,0.13)',
        padding: '56px 64px 48px 64px',
        minWidth: '520px',
        maxWidth: '99vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 2,
        border: '1.5px solid #e5e7eb',
    },
    brandSection: {
        textAlign: 'center',
        color: '#fff',
    },
    brandIcon: {
        fontSize: '2.8rem',
        marginBottom: '12px',
    },
    brandName: {
        fontSize: '2rem',
        fontWeight: 900,
        margin: '0 0 12px 0',
    },
    brandDesc: {
        fontSize: '1rem',
        color: '#dbeafe',
        margin: 0,
    },
    rightPanel: {
        flex: 1.3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 8px 32px 0 rgba(59,130,246,0.10)',
        padding: '40px 32px 32px 32px',
        margin: '32px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 900,
        color: '#0f172a',
        margin: '0 0 8px 0',
    },
    subtitle: {
        fontSize: '0.95rem',
        color: '#64748b',
        margin: '0 0 32px 0',
    },
    form: {
        marginBottom: '24px',
    },
    formGroup: {
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 700,
        color: '#0f172a',
        marginBottom: '8px',
    },
    input: {
        width: '380px',
        maxWidth: '100%',
        padding: '16px 18px',
        fontSize: '1.08rem',
        border: '1.5px solid #cbd5e1',
        borderRadius: '10px',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
        outline: 'none',
        background: '#f8fafc',
        marginBottom: '2px',
    },
    errorBox: {
        background: '#fee2e2',
        color: '#991b1b',
        padding: '12px 14px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '0.9rem',
        border: '1px solid #fecaca',
    },
    button: {
        width: '100%',
        padding: '14px 0',
        fontSize: '1.08rem',
        fontWeight: 700,
        background: 'linear-gradient(90deg,#2563eb,#3b82f6)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px 0 rgba(59,130,246,0.10)',
        transition: 'all 0.2s',
        marginTop: '8px',
    },
    footer: {
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#64748b',
        margin: 0,
    },
    link: {
        color: '#3b82f6',
        textDecoration: 'none',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'color 0.3s ease',
    },
};

export default Register;
