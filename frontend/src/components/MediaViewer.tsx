import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { PostType } from './pack/PostType';
import type { Comment } from './pack/Comment';
import type { User } from './pack/User';

type Props = {
  post: PostType;
  initialIndex: number;
  authorName: string;
  onClose: () => void;
};

const MediaViewer = ({ post, initialIndex, authorName, onClose }: Props) => {
  const [index, setIndex] = useState(initialIndex);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [commentText, setCommentText] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const urls = post.mediaUrls ?? [];

  useEffect(() => {
    const postId = post.originalPostId ?? post.id;
    api.get(`/comments/${postId}`).then((res) => setComments(res.data));
    api.get('/users').then((res) => setUsers(res.data));
  }, [post.id]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight')
        setIndex((i) => Math.min(urls.length - 1, i + 1));
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [urls.length]);

  const getUsername = (authorId: string) => {
    const found = users.find((u) => u.id === authorId);
    return found ? found.username : 'Unknown';
  };

  const submitComment = async () => {
    if (!commentText.trim() || !user) return;
    const postId = post.originalPostId ?? post.id;
    const res = await api.post('/comments', {
      content: commentText,
      authorId: user.id,
      postId,
    });
    setComments((prev) => [...prev, res.data]);
    setCommentText('');
  };

  const currentUrl = urls[index];
  const isVideo = currentUrl?.match(/\.(mp4|mov|avi)$/i);

  const btnStyle = (disabled?: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    background: disabled ? 'var(--btn)' : 'var(--accent)',
    border: 'none',
    borderRadius: '8px',
    color: disabled ? 'var(--text-muted)' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    fontFamily: 'inherit',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
  });

  return (
    <div className="media-viewer-overlay" onClick={onClose}>
      <div className="media-viewer" onClick={(e) => e.stopPropagation()}>
        {/* ліва частина — медіа */}
        <div className="media-viewer-left">
          <button
            className="media-viewer-close"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: 'white',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>

          <div className="media-viewer-media">
            {isVideo ? (
              <video src={currentUrl} controls className="media-viewer-file" />
            ) : (
              <img src={currentUrl} alt="" className="media-viewer-file" />
            )}
          </div>

          {urls.length > 1 && (
            <div className="media-viewer-arrows">
              <button
                style={btnStyle(index === 0)}
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
              >
                ←
              </button>
              <span style={{ color: 'white', fontSize: 14 }}>
                {index + 1} / {urls.length}
              </span>
              <button
                style={btnStyle(index === urls.length - 1)}
                disabled={index === urls.length - 1}
                onClick={() =>
                  setIndex((i) => Math.min(urls.length - 1, i + 1))
                }
              >
                →
              </button>
            </div>
          )}

          {urls.length > 1 && (
            <div className="media-viewer-thumbs">
              {urls.map((url, i) => (
                <div
                  key={i}
                  className={`media-viewer-thumb ${i === index ? 'active' : ''}`}
                  onClick={() => setIndex(i)}
                >
                  {url.match(/\.(mp4|mov|avi)$/i) ? (
                    <video src={url} />
                  ) : (
                    <img src={url} alt="" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* права частина */}
        <div className="media-viewer-right">
          <div
            style={{
              background: 'var(--bg-tertiary)',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              width: '100%', // ← додай
              boxSizing: 'border-box', // ← додай
            }}
          >
            <p
              className="post-author"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                navigate(`/user/${post.authorId}`);
                onClose();
              }}
            >
              {authorName}
            </p>
            <p className="post-text">{post.content}</p>
          </div>

          <p
            style={{ fontWeight: 600, padding: '8px 0', color: 'var(--text)' }}
          >
            Comments ({comments.length})
          </p>

          <div className="media-viewer-comments">
            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <p
                  className="post-author"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigate(`/user/${c.authorId}`);
                    onClose();
                  }}
                >
                  {getUsername(c.authorId)}
                </p>
                <p className="post-text">{c.content}</p>
              </div>
            ))}
          </div>

          {user && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                marginTop: 'auto',
              }}
            >
              <textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'none',
                  minHeight: 70,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={submitComment}
                style={{
                  padding: '10px',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
