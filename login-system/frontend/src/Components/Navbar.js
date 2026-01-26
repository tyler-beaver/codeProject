/*
    Defines a navigation bar for the React frontend

    - Displays navigation links based on whether the user is logged in
    - Provides links to Home, Login, Register, and Dashboard 
    - Handles user logout by clearing the token from localStorage and updating app state 
    - Uses React Router's 'Link' and 'useNavigate' for client side routing 
*/

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ token, setToken }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/login');
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.navContainer}>
                <Link to="/" style={styles.logo}>Platform</Link>
                <div style={styles.navLinks}>
                    <Link to="/" style={styles.link}>Home</Link>
                    {token ? (
                        <>
                            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
                            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.link}>Login</Link>
                            <Link to="/register" style={styles.registerButton}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        background: '#ffffff',
        borderBottom: '1px solid #e4e6eb',
        padding: '12px 40px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    navContainer: {
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#0a66c2',
        textDecoration: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    },
    navLinks: {
        display: 'flex',
        gap: '30px',
        alignItems: 'center',
    },
    link: {
        textDecoration: 'none',
        color: '#000000',
        fontSize: '0.95rem',
        fontWeight: 500,
        transition: 'color 0.3s ease',
        cursor: 'pointer',
    },
    registerButton: {
        textDecoration: 'none',
        color: 'white',
        fontSize: '0.95rem',
        fontWeight: 600,
        background: '#0a66c2',
        padding: '8px 20px',
        borderRadius: '6px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: 'none',
        display: 'inline-block',
    },
    logoutButton: {
        color: 'white',
        fontSize: '0.95rem',
        fontWeight: 600,
        background: '#0a66c2',
        padding: '8px 20px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
};

export default Navbar;

