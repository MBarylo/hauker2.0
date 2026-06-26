import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Text } from '@chakra-ui/react';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Fill in all fields');
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
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
        <h2>Create account</h2>
        <p>Join Hauker today</p>

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
            handleRegister();
          }}
        >
          <Input
            size="md"
            value={username}
            ref={ref}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            size="md"
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            size="md"
            type="password"
            value={password}
            placeholder="Password (min 6 chars)"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button size="md" type="submit" colorScheme="blue" width="100%">
            Create account
          </Button>
        </form>

        <Text
          style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          Already have an account?{' '}
          <span
            style={{ color: 'var(--accent)', cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            Sign in
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

export default RegisterForm;
