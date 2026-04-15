import './App.css';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import PostForm from './components/PostForm';
import Profile from './components/Profile';
import LoginForm from './components/LoginForm';
import { AnimatePresence, motion } from 'framer-motion';
import { usePost } from './components/PostContext';

function App() {
  const { setTheme, theme } = usePost();
  const location = useLocation();

  return (
    <div className={`App ${theme}`}>
      <header>
        <h1>Hauker</h1>

        <Link to="/">🏠 Home</Link>
        <Link to="/profile">👤 Profile</Link>
        <Link to="/login">🚪 Logout</Link>

        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          Switch theme
        </button>
      </header>

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
            path="/profile"
            element={
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <Profile />
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
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
