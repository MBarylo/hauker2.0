import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import PostList from './PostList';
import { api } from '../api';
import type { FormEvent } from 'react';
import { Button, Input, Textarea, Text } from '@chakra-ui/react';

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
    <div className="feed-inner">
      <motion.form className="post-form" onSubmit={submit}>
        <Input
          size="md"
          value={searchItem}
          onChange={(e) => setSearchItem(e.target.value)}
          placeholder="Search..."
        />

        <Textarea
          size="md"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          ref={inputRef}
          placeholder="What's new?"
        />

        <Button size="md" type="submit">
          Post
        </Button>
      </motion.form>

      {error && <Text className="error">{error}</Text>}

      <PostList posts={posts} setPosts={setPosts} searchItem={searchItem} />
    </div>
  );
};

export default PostForm;
