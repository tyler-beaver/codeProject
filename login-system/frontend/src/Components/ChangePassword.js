import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { supabase } from '../supabaseClient';

function ChangePassword({ onClose, onSuccess }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    // Supabase password change
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMessage('Failed to change password: ' + error.message);
    } else {
      setMessage('Password changed successfully!');
      if (onSuccess) onSuccess();
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
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <input
            type={showOld ? 'text' : 'password'}
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
            }}
          />
          <span
            onClick={() => setShowOld((v) => !v)}
            style={{ position: 'absolute', right: 12, top: 16, cursor: 'pointer' }}
            aria-label={showOld ? 'Hide password' : 'Show password'}
          >
            {showOld ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <input
            type={showNew ? 'text' : 'password'}
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
            }}
          />
          <span
            onClick={() => setShowNew((v) => !v)}
            style={{ position: 'absolute', right: 12, top: 16, cursor: 'pointer' }}
            aria-label={showNew ? 'Hide password' : 'Show password'}
          >
            {showNew ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <input
            type={showConfirm ? 'text' : 'password'}
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
            }}
          />
          <span
            onClick={() => setShowConfirm((v) => !v)}
            style={{ position: 'absolute', right: 12, top: 16, cursor: 'pointer' }}
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
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
