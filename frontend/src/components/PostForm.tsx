import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import PostList from './PostList';
import { api } from '../api';
import type { FormEvent } from 'react';
import { Button, Input, Textarea, Text } from '@chakra-ui/react';
import type { PostType } from './pack/PostType';

type FeedTab = 'all' | 'following';

const PostForm = () => {
  const [content, setContent] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState<PostType[]>([]);
  const [followingPosts, setFollowingPosts] = useState<PostType[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [feedTab, setFeedTab] = useState<FeedTab>('all');

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    inputRef.current?.focus();
    api.get('/posts').then((res) => setPosts(res.data));

    if (user) {
      api.get(`/users/${user.id}/bookmarks`).then((res) => {
        setBookmarkedIds(res.data.map((b: any) => b.postId));
      });

      // завантажуємо підписки і стрічку
      api.get(`/users/${user.id}/following`).then(async (res) => {
        const followingIds: string[] = res.data.map((u: any) => u.id);
        // додаємо себе щоб свої пости теж були у стрічці
        const userIds = [...followingIds, user.id];

        const feedRes = await api.post('/posts/following-feed', { userIds });
        setFollowingPosts(feedRes.data);
      });
    }
  }, []);

  if (!user) {
    return (
      <div className="feed-inner">
        <p className="empty">
          Please <a href="/login">log in</a> to post.
        </p>
      </div>
    );
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await api.post('/posts', {
        content,
        authorId: user.id,
      });
      setPosts((prev) => [res.data, ...prev]);
      setFollowingPosts((prev) => [res.data, ...prev]);
      setContent('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const currentPosts = feedTab === 'all' ? posts : followingPosts;
  const setCurrentPosts = feedTab === 'all' ? setPosts : setFollowingPosts;

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

      <div className="profile-tabs" style={{ marginBottom: '1rem' }}>
        <Button
          size="sm"
          variant={feedTab === 'all' ? 'solid' : 'outline'}
          onClick={() => setFeedTab('all')}
        >
          🌍 All
        </Button>
        <Button
          size="sm"
          variant={feedTab === 'following' ? 'solid' : 'outline'}
          onClick={() => setFeedTab('following')}
        >
          👥 Following
        </Button>
      </div>

      <PostList
        posts={currentPosts}
        setPosts={setCurrentPosts}
        searchItem={searchItem}
        bookmarkedIds={bookmarkedIds}
        setBookmarkedIds={setBookmarkedIds}
      />
    </div>
  );
};

export default PostForm;
