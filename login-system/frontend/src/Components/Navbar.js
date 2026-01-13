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
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
            <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
            {token ? (
                <>
                    <Link to="/dashboard" style={{ marginRight: '10px' }}>Dashboard</Link>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
    );
}

export default Navbar;

