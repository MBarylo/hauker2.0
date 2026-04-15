import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import PostList from './PostList';
import { api } from '../api';
import type { FormEvent } from 'react';

type PostType = {
  id: string;
  content: string;
  authorId: string;
};

const PostForm = () => {
  const [content, setContent] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState<PostType[]>([]);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();

    // завантаження постів
    api.get('/posts').then((res) => setPosts(res.data));
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem('user')!);

      if (!user) {
        setError('Login first');
        return;
      }

      const res = await api.post('/posts', {
        content,
        authorId: user.id,
      });

      setPosts((prev) => [res.data, ...prev]); // 🔥 миттєво додаємо
      setContent('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div>
      <motion.form onSubmit={submit}>
        <input
          value={searchItem}
          onChange={(e) => setSearchItem(e.target.value)}
          placeholder="Search..."
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          ref={inputRef}
        />

        <button type="submit">Post</button>
      </motion.form>

      {error && <p className="error">{error}</p>}

      <PostList posts={posts} setPosts={setPosts} searchItem={searchItem} />
    </div>
  );
};

export default PostForm;
