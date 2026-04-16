import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { PostProvider } from './components/PostContext.tsx';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from '@/components/ui/provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider>
        <PostProvider>
          <App />
        </PostProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
