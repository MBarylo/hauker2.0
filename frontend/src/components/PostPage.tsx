import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api';
import { Button, Input, Textarea, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Comment } from './pack/Comment';
import type { User } from './pack/User';
import type { PostType } from './pack/PostType';

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
  };

  const deleteComment = async (commentId: string) => {
    await api.delete(`/comments/${commentId}`, {
      data: { userId: user.id },
    });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  if (!post) return <p>Loading...</p>;

  return (
    <motion.div
      className="feed-inner"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Button size="xs" onClick={() => navigate(-1)}>
        ← Back
      </Button>

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
          <div key={c.id} className="post">
            <p
              className="post-author"
              onClick={() => navigate(`/user/${c.authorId}`)}
              style={{ cursor: 'pointer' }}
            >
              {getUsername(c.authorId)}
            </p>
            <p className="post-text">{c.content}</p>
            {user?.id === c.authorId && (
              <div className="post-footer">
                <Button size="xs" onClick={() => deleteComment(c.id)}>
                  Delete
                </Button>
              </div>
            )}
          </div>
        ))}

        {user ? (
          <div className="post-form" style={{ marginTop: '1rem' }}>
            <Textarea
              size="md"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button size="md" onClick={submitComment}>
              Comment
            </Button>
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
