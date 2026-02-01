import React, { useState } from 'react';
import axios from 'axios';
import { sharedFont, sharedBox, sharedButton, sharedInput } from '../styles/shared';

function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, password });
      setMessage('Password reset! You can now log in.');
    } catch (err) {
      setMessage('Reset failed. Try again.');
    }
    setLoading(false);
  };

  if (!token) return <div>Invalid or missing token.</div>;

  return (
    <div style={{...sharedBox, maxWidth: 400, margin: '40px auto', padding: 32}}>
      <h2 style={{fontFamily: sharedFont}}>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required style={sharedInput} />
        <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={sharedInput} />
        <button type="submit" disabled={loading} style={sharedButton}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {message && <div style={{marginTop: 16, color: message.includes('!') ? 'green' : 'red', fontFamily: sharedFont}}>{message}</div>}
    </div>
  );
}

export default ResetPassword;
