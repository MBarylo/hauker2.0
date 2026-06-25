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
    onClose();
    navigate('/login');
    window.dispatchEvent(new Event('storage'));
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
          <Button size="xs" onClick={onClose}>
            ✕
          </Button>
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </Button>
          </div>

          <hr style={{ borderColor: 'var(--border)' }} />

          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={handleLogout}
          >
            🚪 Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
