import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ForgotPassword from '../components/ForgotPassword';

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Not authenticated');
                    setLoading(false);
                    return;
                }
                const res = await axios.get('/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data.user);
            } catch (err) {
                if (err.response && err.response.data && err.response.data.error) {
                    setError('Failed to load profile: ' + err.response.data.error);
                } else if (err.message) {
                    setError('Failed to load profile: ' + err.message);
                } else {
                    setError('Failed to load profile (unknown error)');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const [showForgot, setShowForgot] = useState(false);
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div style={{ color: '#991b1b', fontWeight: 600 }}>{error}</div>
                ) : user ? (
                    <>
                        <div style={styles.avatarSection}>
                            <div style={styles.avatar}>
                                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="32" cy="32" r="32" fill="#2563eb"/>
                                    <circle cx="32" cy="26" r="12" fill="#fff"/>
                                    <ellipse cx="32" cy="48" rx="18" ry="10" fill="#fff"/>
                                </svg>
                            </div>
                            <h2 style={styles.name}>{user.username || user.name}</h2>
                            <p style={styles.email}>{user.email}</p>
                            <button onClick={() => setShowForgot(true)} style={{marginTop: 16, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700, cursor: 'pointer'}}>Reset Password</button>
                        </div>
                        {showForgot && (
                            <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <div style={{background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.12)'}}>
                                    <h3 style={{marginTop: 0}}>Reset your password</h3>
                                    <ForgotPassword onSent={() => setShowForgot(false)} />
                                    <button onClick={() => setShowForgot(false)} style={{marginTop: 16, background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '8px 18px', color: '#475569', fontWeight: 700, cursor: 'pointer'}}>Close</button>
                                </div>
                            </div>
                        )}
                        <div style={styles.infoSection}>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Joined:</span>
                                <span style={styles.infoValue}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: '40px 0',
    },
    card: {
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 8px 32px 0 rgba(59,130,246,0.10)',
        padding: '48px 40px 40px 40px',
        minWidth: '380px',
        maxWidth: '95vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatarSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '32px',
    },
    avatar: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'rgba(37,99,235,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
    },
    name: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#0f172a',
        margin: 0,
    },
    email: {
        fontSize: '1rem',
        color: '#64748b',
        margin: '8px 0 0 0',
    },
    infoSection: {
        width: '100%',
        marginTop: '16px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #e5e7eb',
        fontSize: '1.05rem',
    },
    infoLabel: {
        color: '#64748b',
        fontWeight: 500,
    },
    infoValue: {
        color: '#0f172a',
        fontWeight: 600,
    },
};

export default Profile;
