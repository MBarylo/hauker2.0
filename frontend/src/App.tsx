import './App.css'
import PostForm from './components/PostForm'
import Profile from './components/Profile'
import LoginForm from './components/LoginForm'
import { AnimatePresence, motion } from 'framer-motion'
import { usePost } from './components/PostContext'

function App() {
  const { page, setPage, setTheme, theme } = usePost()
  return (
    <div>
      <AnimatePresence mode="wait">
        {page === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.4 }}
          >
            <LoginForm />
          </motion.div>
        ) : page === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.4 }}
            className={`App ${theme}`}
          >
            <header>
              <h1>Hauker</h1>
              <button onClick={() => setPage('home')}>🏠 Home</button>
              <button onClick={() => setPage('profile')}>👤 Profile</button>
              <button onClick={() => setPage('login')}>🚪 Logout</button>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                Switch theme
              </button>
            </header>
            <PostForm />
            <div className="recomendations">
              <div>
                <h1>Subscribe Premium</h1>
                <p>
                  Get rid of ads, view analytics, boost your hauks, and get over
                  20 features
                </p>
                <button>Subscribe</button>
              </div>
              <div>
                <h1>What's happening?</h1>
                {/* Most popular posts */}
              </div>
              <div>
                <h1>Recommended</h1>
                {/* Recommended posts to you */}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <Profile />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
