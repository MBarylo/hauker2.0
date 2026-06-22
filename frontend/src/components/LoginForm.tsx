import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '@chakra-ui/react';

const LoginForm = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleLogin = async () => {
    try {
      if (!value.trim()) {
        setError('Enter username');
        return;
      }

      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        api.get('/users').then((res) => {
          const exists = res.data.find((u: any) => u.id === parsed.id);
          if (!exists) {
            localStorage.removeItem('user'); // юзера немає на бекенді — чистимо
          }
        });
      }

      setError('');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="feed-inner">
      <form className="post-form">
        <Input
          size="md"
          value={value}
          ref={ref}
          onChange={(e) => setValue(e.target.value)}
        />

        <Button size="md" onClick={handleLogin}>
          Login
        </Button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
};

export default LoginForm;
