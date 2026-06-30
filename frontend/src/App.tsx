import './App.css';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import PostForm from './components/PostForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PostPage from './components/PostPage';
import UserProfile from './components/UserProfile';
import Settings from './components/Settings';
import AdminPanel from './components/AdminPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from './api';

function App() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('user') || 'null'),
  );

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      api.get('/users').then((res) => {
        const exists = res.data.find((u: any) => u.id === parsed.id);
        if (!exists) {
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
        setReady(true);
      });
    } else {
      setReady(true);
    }

    const handleStorage = () => {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      setCurrentUser(user);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('auth-change', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('auth-change', handleStorage);
    };
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setCurrentUser(user);
  }, [location]);

  if (!ready) return null;

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1 className="logo">Hauker</h1>

        <nav className="nav">
          <Link to="/" className="nav-link">
            🏠 Home
          </Link>
          <Link
            to={currentUser ? `/user/${currentUser.id}` : '/login'}
            className="nav-link"
          >
            👤 Profile
          </Link>
          {currentUser?.role === 'admin' && (
            <Link to="/admin" className="nav-link">
              ⚙️ Admin
            </Link>
          )}
          <button className="nav-link" onClick={() => setSettingsOpen(true)}>
            ⚙️ Settings
          </button>
        </nav>
        {settingsOpen && (
          <Settings
            onClose={() => setSettingsOpen(false)}
            onLogout={() => setCurrentUser(null)}
          />
        )}
      </aside>

      <main className="feed">
        <div className="feed-inner">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                  >
                    <PostForm />
                  </motion.div>
                }
              />
              <Route
                path="/user/:id"
                element={
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <UserProfile />
                  </motion.div>
                }
              />
              <Route
                path="/login"
                element={
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                  >
                    <LoginForm />
                  </motion.div>
                }
              />
              <Route
                path="/register"
                element={
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <RegisterForm />
                  </motion.div>
                }
              />

              <Route
                path="/post/:id"
                element={
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <PostPage />
                  </motion.div>
                }
              />
              <Route
                path="/admin"
                element={
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <AdminPanel />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
