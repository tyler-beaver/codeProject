// Centralized shared styles for font, box, and button

export const sharedFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif';

export const sharedBox = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 8px 32px 0 rgba(59,130,246,0.13)',
  border: '1.5px solid #e5e7eb',
  fontFamily: sharedFont,
};

export const sharedButton = {
  background: '#3b82f6',
  border: 'none',
  borderRadius: 8,
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '1.05rem',
  padding: '10px 24px',
  transition: 'background 0.2s',
  fontFamily: sharedFont,
};

export const sharedInput = {
  width: '100%',
  padding: '14px 18px',
  fontSize: '1.08rem',
  border: '1.5px solid #cbd5e1',
  borderRadius: 10,
  boxSizing: 'border-box',
  fontFamily: sharedFont,
  transition: 'all 0.2s',
  outline: 'none',
  background: '#f8fafc',
  marginBottom: 16,
};
