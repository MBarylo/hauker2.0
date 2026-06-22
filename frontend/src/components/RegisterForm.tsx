import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input, Button, Text } from '@chakra-ui/react';
import type { User } from './pack/User';

const RegisterForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const prefilled = (location.state as any)?.username || '';
  const [value, setValue] = useState(prefilled);
  const [error, setError] = useState('');
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleRegister = async () => {
    if (!value.trim()) {
      setError('Enter username');
      return;
    }

    try {
      const res = await api.get('/users');
      const exists = res.data.find((u: User) => u.username === value.trim());

      if (exists) {
        setError('Username already taken');
        return;
      }

      const newUser = await api.post('/users', { username: value.trim() });
      localStorage.setItem('user', JSON.stringify(newUser.data));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="feed-inner">
      <form
        className="post-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
      >
        <Input
          size="md"
          value={value}
          ref={ref}
          placeholder="Choose username"
          onChange={(e) => setValue(e.target.value)}
        />

        <Button size="md" type="submit">
          Register
        </Button>
      </form>

      {error && <Text color="red.500">{error}</Text>}
    </div>
  );
};

export default RegisterForm;
