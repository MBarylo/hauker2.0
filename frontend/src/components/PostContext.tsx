import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface T {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const PostContext = createContext<T | undefined>(undefined);

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <PostContext.Provider value={{ theme, setTheme }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePost = (): T => {
  const context = useContext(PostContext);
  if (!context) throw new Error('usePost must be used inside PostProvider');
  return context;
};
