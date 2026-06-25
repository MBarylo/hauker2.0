import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Button, Text, Textarea } from '@chakra-ui/react';
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

  return (
    <div className="media-viewer-overlay" onClick={onClose}>
      <div className="media-viewer" onClick={(e) => e.stopPropagation()}>
        {/* ліва частина — медіа */}
        <div className="media-viewer-left">
          <Button size="xs" className="media-viewer-close" onClick={onClose}>
            ✕
          </Button>

          <div className="media-viewer-media">
            {isVideo ? (
              <video
                src={`http://localhost:3000${currentUrl}`}
                controls
                className="media-viewer-file"
              />
            ) : (
              <img
                src={`http://localhost:3000${currentUrl}`}
                alt=""
                className="media-viewer-file"
              />
            )}
          </div>

          {/* стрілки */}
          {urls.length > 1 && (
            <div className="media-viewer-arrows">
              <Button
                size="sm"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
              >
                ←
              </Button>
              <Text fontSize="sm">
                {index + 1} / {urls.length}
              </Text>
              <Button
                size="sm"
                onClick={() =>
                  setIndex((i) => Math.min(urls.length - 1, i + 1))
                }
                disabled={index === urls.length - 1}
              >
                →
              </Button>
            </div>
          )}

          {/* мініатюри */}
          {urls.length > 1 && (
            <div className="media-viewer-thumbs">
              {urls.map((url, i) => (
                <div
                  key={i}
                  className={`media-viewer-thumb ${i === index ? 'active' : ''}`}
                  onClick={() => setIndex(i)}
                >
                  {url.match(/\.(mp4|mov|avi)$/i) ? (
                    <video src={`http://localhost:3000${url}`} />
                  ) : (
                    <img src={`http://localhost:3000${url}`} alt="" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* права частина — вміст поста */}
        <div className="media-viewer-right">
          <div className="post" style={{ cursor: 'default' }}>
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

          <Text fontWeight="bold" style={{ padding: '8px 0' }}>
            Comments ({comments.length})
          </Text>

          <div className="media-viewer-comments">
            {comments.map((c) => (
              <div key={c.id} className="post">
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
            <div className="post-form" style={{ marginTop: 'auto' }}>
              <Textarea
                size="sm"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button size="sm" onClick={submitComment}>
                Comment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
