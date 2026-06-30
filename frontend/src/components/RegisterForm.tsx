import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { Input, Text } from '@chakra-ui/react';
import Toast from './Toast';

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
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = 'var(--accent-hover)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = 'var(--accent)')
            }
          >
            Create account
          </button>
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
          <Toast message={error} type="error" onClose={() => setError('')} />
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
