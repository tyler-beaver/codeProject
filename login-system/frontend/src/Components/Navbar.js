/*
    Defines a navigation bar for the React frontend

    - Displays navigation links based on whether the user is logged in
    - Provides links to Homem, Login, Register, and Dashboard 
    - Hanldes user logout by clearing the token from localStorage and updating app state 
    - Uses React Router's 'Link' and 'useNavigate' for client side routing 

    This component centralizes navigation logic and adapts the UI 
    dynamically based on authentication state 
*/

import React from 'react';
import { Links, useNavigate } from 'react-router-dom';


// function Navbar({ token, setToken }) {
//   const navigate = useNavigate();

function Navbar({ token, setToken }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('tokn');
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
