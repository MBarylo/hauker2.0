import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import type Post from './pack/PostClass'
import type PostComment from './pack/PostComment'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'
type Page = 'login' | 'home' | 'profile'

interface T {
  posts: Post[]
  addPost: (text: string) => void
  removePost: (id: number) => void
  likePost: (id: number) => void
  addComment: (postId: number, text: string) => void
  removeComment: (postId: number, commentId: number) => void
  login: (value: string) => Promise<void>
  currentUser: User | null
  setCurrentUser: (user: User) => void
  page: Page
  setPage: (page: Page) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

interface User {
  name: string
  id: number
  photo: string
}

const PostContext = createContext<T | undefined>(undefined)

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [page, setPage] = useState<Page>('login')
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const savedPost = localStorage.getItem('posts')
    const savedUser = localStorage.getItem('user')
    const savedTheme = localStorage.getItem('theme')

    if (savedPost) {
      try {
        setPosts(JSON.parse(savedPost))
      } catch (e) {
        console.error('Invalid post data:', savedPost)
        localStorage.removeItem('posts')
      }
    }

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
        setPage('home')
      } catch (e) {
        console.error('Invalid user data:', savedUser)
        localStorage.removeItem('user')
      }
    }
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme)
  }, [])

  useEffect(() => {
    document.body.className = theme // додаємо "light" або "dark" на body
  }, [theme])

  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('posts', JSON.stringify(posts))
    }
  }, [posts])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser))
    }
  }, [currentUser])

  useEffect(() => {
    if (theme) {
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  const addPost = useCallback(
    (text: string) => {
      if (!currentUser) return
      const newPost: Post = {
        id: Date.now(),
        author: currentUser.name,
        text,
        likes: 0,
        comments: [],
        createdAt: Date.now(),
      }
      setPosts((prev: Post[]) => [newPost, ...prev])
    },
    [currentUser],
  )

  const removePost = useCallback((id: number) => {
    setPosts((prev) => prev.filter((post: Post) => post.id !== id))
  }, [])

  const likePost = useCallback((id: number) => {
    setPosts((prevPosts: Post[]): Post[] => {
      const updated = prevPosts.map((post: Post) =>
        post.id === id ? { ...post, likes: post.likes + 1 } : post,
      )
      localStorage.setItem('posts', JSON.stringify(updated))
      return updated
    })
  }, [])

  const addComment = useCallback(
    (postId: number, text: string) => {
      if (!currentUser) return
      setPosts((prevPosts: Post[]) =>
        prevPosts.map((post: Post) =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  {
                    id: Date.now(),
                    author: currentUser.name,
                    text,
                    createdAt: Date.now(),
                  },
                ],
              }
            : post,
        ),
      )
    },
    [currentUser],
  )

  const removeComment = useCallback((postId: number, commentId: number) => {
    setPosts((prevPosts: Post[]) =>
      prevPosts.map((post: Post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.filter(
                (c: PostComment) => c.id !== commentId,
              ),
            }
          : post,
      ),
    )
  }, [])

  const login = async (value: string) => {
    if (!value.trim()) {
      alert('Enter name before login!')
      return
    }

    const res = await fetch(
      `https://api.dicebear.com/9.x/adventurer/svg?seed=${value}`,
    )
    const avatar = await res.text()

    const newUser: User = {
      name: value,
      photo: avatar,
      id: Date.now(),
    }

    setCurrentUser(newUser)
    setPage('home')
    console.log('Current page:', page)
  }

  return (
    <div>
      <PostContext.Provider
        value={{
          posts,
          addPost,
          removePost,
          likePost,
          addComment,
          removeComment,
          login,
          currentUser,
          setCurrentUser,
          page,
          setPage,
          setTheme,
          theme,
        }}
      >
        {children}
      </PostContext.Provider>
    </div>
  )
}

export const usePost = (): T => {
  const context = useContext(PostContext)

  if (!context) {
    throw new Error('usePost must be used inside PostProvider')
  }

  return context
}
