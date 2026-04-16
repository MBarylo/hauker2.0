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

      const users = await api.get('/users');

      const existingUser = users.data.find((u: any) => u.username === value);

      if (existingUser) {
        localStorage.setItem('user', JSON.stringify(existingUser));
      } else {
        const res = await api.post('/users', {
          username: value,
        });
        localStorage.setItem('user', JSON.stringify(res.data));
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
