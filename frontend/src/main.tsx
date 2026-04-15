import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PostProvider } from './components/PostContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostProvider>
      <App />
    </PostProvider>
  </StrictMode>,
)
