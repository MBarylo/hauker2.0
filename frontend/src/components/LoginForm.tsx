import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '@chakra-ui/react';
import type { User } from './pack/User';

const LoginForm = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleLogin = async () => {
    if (!value.trim()) {
      setError('Enter username');
      return;
    }

    try {
      const res = await api.get('/users');
      const users = res.data;
      const user = users.find((u: User) => u.username === value.trim());

      if (!user) {
        navigate('/register', { state: { username: value.trim() } });
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));
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
