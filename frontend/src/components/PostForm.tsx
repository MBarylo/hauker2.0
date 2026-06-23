import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import PostList from './PostList';
import { api } from '../api';
import type { FormEvent } from 'react';
import { Button, Input, Textarea, Text } from '@chakra-ui/react';
import type { PostType } from './pack/PostType';

const PostForm = () => {
  const [content, setContent] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState<PostType[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    api.get('/posts').then((res) => setPosts(res.data));
  }, []);

  useEffect(() => {
    if (user) {
      api.get(`/users/${user.id}/bookmarks`).then((res) => {
        setBookmarkedIds(res.data.map((b: any) => b.postId));
      });
    }
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
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

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) {
    return (
      <div className="feed-inner">
        <p className="empty">
          Please <a href="/login">log in</a> to post.
        </p>
      </div>
    );
  }

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

      <PostList
        posts={posts}
        setPosts={setPosts}
        searchItem={searchItem}
        bookmarkedIds={bookmarkedIds}
        setBookmarkedIds={setBookmarkedIds}
      />
    </div>
  );
};

export default PostForm;
