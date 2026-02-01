import React, { useState } from 'react';
import axios from 'axios';

function ForgotPassword({ onSent }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post('/api/auth/request-password-reset', { email });
      setMessage('Check your email for a reset link.');
      if (onSent) onSent();
    } catch (err) {
      setMessage('Failed to send reset email.');
    }
    setLoading(false);
  };

  return (
    <div style={{marginTop: 24}}>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required style={{width: '100%', marginBottom: 12, padding: 8}} />
        <button type="submit" disabled={loading} style={{width: '100%', padding: 10, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4}}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {message && <div style={{marginTop: 12, color: message.includes('Check') ? 'green' : 'red'}}>{message}</div>}
    </div>
  );
}

export default ForgotPassword;
