import React, { useState } from 'react';
import axios from 'axios';

function ChangePassword({ onClose, onSuccess }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (newPassword !== confirm) {
      setMessage('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Password changed successfully!');
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage('Failed to change password');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
      width: 400,
      maxWidth: '100%',
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 8px 32px 0 rgba(59,130,246,0.10)',
      padding: '22px 14px 18px 14px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <input
          type="password"
          placeholder="Current password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '16px 18px',
            fontSize: '1.08rem',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            outline: 'none',
            background: '#f8fafc',
            marginBottom: 14,
          }}
        />
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '16px 18px',
            fontSize: '1.08rem',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            outline: 'none',
            background: '#f8fafc',
            marginBottom: 14,
          }}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '16px 18px',
            fontSize: '1.08rem',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            outline: 'none',
            background: '#f8fafc',
            marginBottom: 14,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
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
            marginTop: 8,
          }}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
      {message && (
        <div
          style={{
            marginTop: 16,
            background: message.includes('success') ? '#dcfce7' : '#fee2e2',
            color: message.includes('success') ? '#166534' : '#991b1b',
            padding: '12px 14px',
            borderRadius: 8,
            fontSize: '0.98rem',
            border: message.includes('success') ? '1px solid #bbf7d0' : '1px solid #fecaca',
            width: '100%',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {message}
        </div>
      )}
      <button
        onClick={onClose}
        style={{
          marginTop: 16,
          background: '#f1f5f9',
          border: 'none',
          borderRadius: 6,
          padding: '8px 18px',
          color: '#475569',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Close
      </button>
    </div>
  );
}

export default ChangePassword;
