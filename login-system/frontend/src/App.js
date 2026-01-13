import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    }, [token]);

    return (
        <Router>
            <Navbar token={token} setToken={setToken} />
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/" element={<h2 style={{ textAlign: 'center', marginTop: '20px' }}>Welcome Home!</h2>} />
                <Route path="/dashboard" element={<h2 style={{ textAlign: 'center', marginTop: '20px' }}>Dashboard</h2>} />
            </Routes>
        </Router>
    );
}

export default App;
