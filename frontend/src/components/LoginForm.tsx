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
      console.log(res.data);
      localStorage.setItem('token', res.data.token);
      window.dispatchEvent(new Event('storage'));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Hauker</h1>
        <h2>Welcome back</h2>
        <p>Sign in to your account</p>

        <form
          className="post-form"
          style={{
            boxShadow: 'none',
            border: 'none',
            padding: 0,
            marginBottom: 0,
          }}
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
          <Button size="md" type="submit" colorScheme="blue" width="100%">
            Sign in
          </Button>
        </form>

        <Text
          style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          Don't have an account?{' '}
          <span
            style={{ color: 'var(--accent)', cursor: 'pointer' }}
            onClick={() => navigate('/register')}
          >
            Register
          </span>
        </Text>

        {error && (
          <Text color="red.500" textAlign="center">
            {error}
          </Text>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
