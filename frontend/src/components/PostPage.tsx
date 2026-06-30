import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api';
import { Textarea, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Comment } from './pack/Comment';
import type { User } from './pack/User';
import type { PostType } from './pack/PostType';
import CommentItem from './CommentsItem';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [post, setPost] = useState<PostType | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/posts/${id}`).then((res) => {
      setPost(res.data);
      api.get('/users').then((usersRes) => {
        setUsers(usersRes.data);
        const author = usersRes.data.find(
          (u: User) => u.id === res.data.authorId,
        );
        setAuthorName(author ? author.username : 'Unknown');
      });
    });

    api.get(`/comments/${id}`).then((res) => setComments(res.data));
  }, [id]);

  const getUsername = (authorId: string) => {
    const found = users.find((u) => u.id === authorId);
    return found ? found.username : 'Unknown';
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      setError('Login first');
      return;
    }

    const res = await api.post('/comments', {
      content: commentText,
      authorId: user.id,
      postId: id,
    });

    setComments((prev) => [...prev, res.data]);
    setCommentText('');
    setError('');

    // оновлюємо пост щоб отримати новий commentCount
    const updatedPost = await api.get(`/posts/${id}`);
    setPost(updatedPost.data);
  };

  const deleteComment = async (commentId: string) => {
    await api.delete(`/comments/${commentId}`, {
      data: { userId: user.id },
    });
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    // оновлюємо пост щоб отримати новий commentCount
    const updatedPost = await api.get(`/posts/${id}`);
    setPost(updatedPost.data);
  };

  if (!post) return <p>Loading...</p>;

  return (
    <motion.div
      className="feed-inner"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: '8px 16px',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          color: 'var(--text)',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: 'inherit',
          marginBottom: '16px',
          transition: 'all 0.15s ease',
        }}
      >
        ← Back
      </button>

      <div className="post">
        <p
          className="post-author"
          onClick={() => navigate(`/user/${post.authorId}`)}
          style={{ cursor: 'pointer' }}
        >
          {authorName}
        </p>
        <p className="post-text">{post.content}</p>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <Text fontWeight="bold">Comments ({comments.length})</Text>

        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            authorName={getUsername(c.authorId)}
            currentUserId={user?.id}
            onDelete={deleteComment}
            onEdit={(id, content) => {
              setComments((prev) =>
                prev.map((cm) => (cm.id === id ? { ...cm, content } : cm)),
              );
            }}
            onNavigate={(userId) => navigate(`/user/${userId}`)}
          />
        ))}

        {user ? (
          <div className="post-form" style={{ marginTop: '1rem' }}>
            <Textarea
              size="md"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              onClick={submitComment}
              style={{
                width: '100%',
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
            >
              Comment
            </button>
          </div>
        ) : (
          <Text>
            Please <a href="/login">log in</a> to comment.
          </Text>
        )}

        {error && <Text color="red.500">{error}</Text>}
      </div>
    </motion.div>
  );
};

export default PostPage;
