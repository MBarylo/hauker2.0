import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Text } from '@chakra-ui/react';

const LoginForm = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleLogin = async () => {
    if (!login.trim() || !password.trim()) {
      setError('Fill in all fields');
      return;
    }

    try {
      const res = await api.post('/auth/login', { login, password });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      window.dispatchEvent(new Event('storage'));
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
          handleLogin();
        }}
      >
        <Input
          size="md"
          value={login}
          ref={ref}
          placeholder="Username or email"
          onChange={(e) => setLogin(e.target.value)}
        />
        <Input
          size="md"
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button size="md" type="submit">
          Login
        </Button>
      </form>

      <Text
        style={{ cursor: 'pointer', marginTop: '8px', color: 'var(--accent)' }}
        onClick={() => navigate('/register')}
      >
        No account? Register
      </Text>

      {error && <Text color="red.500">{error}</Text>}
    </div>
  );
};

export default LoginForm;
