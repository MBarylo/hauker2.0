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
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    inputRef.current?.focus();
    api.get('/posts').then((res) => setPosts(res.data));

    if (user) {
      api.get(`/users/${user.id}/bookmarks`).then((res) => {
        setBookmarkedIds(res.data.map((b: any) => b.postId));
      });

      api.get(`/users/${user.id}/following`).then(async (res) => {
        const followingIds: string[] = res.data.map((u: any) => u.id);
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

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).slice(0, 4);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('authorId', user.id);
      files.forEach((f) => formData.append('files', f));

      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPosts((prev) => [res.data, ...prev]);
      setFollowingPosts((prev) => [res.data, ...prev]);
      setContent('');
      setFiles([]);
      setPreviews([]);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const currentPosts = feedTab === 'all' ? posts : followingPosts;
  const setCurrentPosts = (fn: any) => {
    setPosts(fn);
    setFollowingPosts(fn);
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

        {/* прев'ю файлів */}
        {previews.length > 0 && (
          <div className="media-preview">
            {previews.map((src, i) => (
              <div key={i} className="media-preview-item">
                {files[i]?.type.startsWith('video') ? (
                  <video src={src} controls />
                ) : (
                  <img src={src} alt="" />
                )}
                <button
                  type="button"
                  className="media-remove"
                  onClick={() => removeFile(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            📎 {files.length > 0 ? `${files.length} file(s)` : 'Add media'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/mov,video/avi"
            multiple
            style={{ display: 'none' }}
            onChange={handleFiles}
          />
          <Button size="md" type="submit">
            Post
          </Button>
        </div>
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
