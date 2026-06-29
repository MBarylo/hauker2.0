import { Button, Text } from '@chakra-ui/react';
import { usePost } from './PostContext';
import { useNavigate } from 'react-router-dom';

type Props = {
  onClose: () => void;
};

const Settings = ({ onClose }: Props) => {
  const { theme, setTheme } = usePost();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    onClose();
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  return (
    <div className="follow-modal" onClick={onClose}>
      <div className="follow-modal-inner" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text fontWeight="bold">Settings</Text>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              color: 'var(--text)',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'inherit',
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text>Theme</Text>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>

          <hr style={{ borderColor: 'var(--border)' }} />

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              color: 'var(--danger)',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
