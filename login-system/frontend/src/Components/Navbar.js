import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ token, setToken }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/');
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.navContainer}>
                <Link to="/" style={styles.logo}>
                    <span style={styles.logoIcon}>🎯</span>
                    <span style={{letterSpacing: '1px'}}>JobTracker</span>
                </Link>
                <div style={styles.navLinks}>
                    <Link to="/" style={styles.navLink} onMouseEnter={e => e.target.style.color = '#2563eb'} onMouseLeave={e => e.target.style.color = '#4b5563'}>Home</Link>
                    {token && <Link to="/dashboard" style={styles.navLink} onMouseEnter={e => e.target.style.color = '#2563eb'} onMouseLeave={e => e.target.style.color = '#4b5563'}>Dashboard</Link>}
                    {!token && (
                        <>
                            <Link to="/login" style={styles.navLink} onMouseEnter={e => e.target.style.color = '#2563eb'} onMouseLeave={e => e.target.style.color = '#4b5563'}>Sign In</Link>
                            <Link to="/register" style={{...styles.navLink, ...styles.signUpBtn}} onMouseEnter={e => e.target.style.background = 'linear-gradient(90deg,#1d4ed8,#2563eb)'} onMouseLeave={e => e.target.style.background = '#2563eb'}>Sign Up</Link>
                        </>
                    )}
                    {token && (
                        <>
                            <span style={styles.avatar} title="Profile">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="16" cy="16" r="16" fill="#2563eb"/>
                                    <circle cx="16" cy="13" r="6" fill="#fff"/>
                                    <ellipse cx="16" cy="24" rx="8" ry="5" fill="#fff"/>
                                </svg>
                            </span>
                            <button 
                                style={{...styles.navLink, ...styles.signUpBtn, marginLeft: 8}}
                                onClick={handleLogout}
                                onMouseEnter={e => e.target.style.background = 'linear-gradient(90deg,#1d4ed8,#2563eb)'}
                                onMouseLeave={e => e.target.style.background = '#2563eb'}
                            >
                                Sign Out
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        background: 'linear-gradient(90deg,rgba(59,130,246,0.07) 0%,rgba(255,255,255,0.97) 100%)',
        borderBottom: '1px solid #e5e7eb',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 16px 0 rgba(59,130,246,0.10)',
        borderRadius: '0 0 18px 18px',
        backdropFilter: 'blur(6px)',
        transition: 'box-shadow 0.2s',
    },
        avatar: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
            marginRight: 2,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(37,99,235,0.08)',
            boxShadow: '0 2px 8px 0 rgba(59,130,246,0.10)',
            cursor: 'pointer',
            transition: 'background 0.2s',
        },
    navContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 40px',
        boxSizing: 'border-box',
    },
    logo: {
        fontSize: '1.7rem',
        fontWeight: 900,
        color: '#1f2937',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 18px 6px 0',
        borderRadius: '10px',
        background: 'none',
        transition: 'background 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
        letterSpacing: '0.5px',
    },
    logoIcon: {
        fontSize: '2.1rem',
        marginRight: '2px',
    },
    navLinks: {
        display: 'flex',
        gap: '22px',
        alignItems: 'center',
    },
    navLink: {
        color: '#4b5563',
        textDecoration: 'none',
        fontWeight: 500,
        fontSize: '1.05rem',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        transition: 'color 0.3s, background 0.2s',
        padding: '8px 10px',
        borderRadius: '6px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    },
    signUpBtn: {
        color: '#fff',
        background: '#2563eb',
        padding: '8px 24px',
        borderRadius: '8px',
        fontWeight: 700,
        boxShadow: '0 2px 8px 0 rgba(59,130,246,0.10)',
        transition: 'all 0.2s',
        border: 'none',
    },
};

export default Navbar;

