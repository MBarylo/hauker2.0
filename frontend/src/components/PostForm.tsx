import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import PostList from './PostList';
import { api } from '../api';
import type { FormEvent } from 'react';
import { Input, Textarea } from '@chakra-ui/react';
import type { PostType } from './pack/PostType';
import Toast from './Toast';

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
      <div
        className="feed-inner"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: '16px',
        }}
      >
        <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)' }}>
          Welcome to Hauker
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          Sign in to post and interact with others
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={() => (window.location.href = '/login')}
            style={{
              padding: '10px 24px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            Sign in
          </button>
          <button
            onClick={() => (window.location.href = '/register')}
            style={{
              padding: '10px 24px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: '15px',
              fontFamily: 'inherit',
            }}
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);

    if (selected.length > 4) {
      setError('You can attach up to 4 files');
      e.target.value = ''; // ← скидає вибір файлів
      return; // ← не зберігаємо нічого
    }

    setError('');
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

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              flex: 1,
              padding: '10px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.borderColor = 'var(--accent)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.borderColor = 'var(--border)')
            }
          >
            📎 {files.length > 0 ? `${files.length} file(s)` : 'Add media'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/mov,video/avi"
            multiple
            style={{ display: 'none' }}
            onChange={handleFiles}
          />
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '10px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = 'var(--accent-hover)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = 'var(--accent)')
            }
          >
            Post
          </button>
        </div>
      </motion.form>

      {error && (
        <Toast message={error} type="error" onClose={() => setError('')} />
      )}

      <div
        style={{
          display: 'flex',
          gap: '0',
          marginBottom: '16px',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {(['all', 'following'] as const).map((t, i) => (
          <button
            key={t}
            onClick={() => setFeedTab(t)}
            style={{
              flex: 1,
              padding: '10px',
              background: feedTab === t ? 'var(--accent)' : 'transparent',
              color: feedTab === t ? 'white' : 'var(--text-muted)',
              border: 'none',
              borderRight: i === 0 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: feedTab === t ? 600 : 400,
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            {t === 'all' ? '🌍 All' : '👥 Following'}
          </button>
        ))}
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
