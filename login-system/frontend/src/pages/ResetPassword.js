import React, { useState } from 'react';
import axios from 'axios';

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
    <div style={{maxWidth: 400, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8}}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required style={{width: '100%', marginBottom: 12, padding: 8}} />
        <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={{width: '100%', marginBottom: 12, padding: 8}} />
        <button type="submit" disabled={loading} style={{width: '100%', padding: 10, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4}}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {message && <div style={{marginTop: 16, color: message.includes('!') ? 'green' : 'red'}}>{message}</div>}
    </div>
  );
}

export default ResetPassword;
