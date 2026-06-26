import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Button, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { User } from './pack/User';
import type { PostType } from './pack/PostType';

type Comment = {
  id: string;
  content: string;
  authorId: string;
  postId: string;
};

type AdminTab = 'users' | 'posts' | 'comments';

const AdminPanel = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const [tab, setTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }

    api.get('/admin/users').then((res) => {
      setUsers(res.data);
      const map: Record<string, string> = {};
      res.data.forEach((u: User) => {
        map[u.id] = u.username;
      });
      setUsernames(map);
    });
    api.get('/admin/posts').then((res) => setPosts(res.data));
    api.get('/admin/comments').then((res) => setComments(res.data));
  }, []);

  const deleteUser = async (id: string) => {
    await api.delete(`/admin/users/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const deletePost = async (id: string) => {
    await api.delete(`/admin/posts/${id}`);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const deleteComment = async (id: string) => {
    await api.delete(`/admin/comments/${id}`);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'users', label: `👥 Users (${users.length})` },
    { key: 'posts', label: `📝 Posts (${posts.length})` },
    { key: 'comments', label: `💬 Comments (${comments.length})` },
  ];

  return (
    <motion.div
      className="feed-inner"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="profile">
        <h2>⚙️ Admin Panel</h2>
      </div>

      <div className="profile-tabs" style={{ marginBottom: '1rem' }}>
        {tabs.map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={tab === t.key ? 'solid' : 'outline'}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* юзери */}
      {tab === 'users' && (
        <div>
          {users.map((u) => (
            <div key={u.id} className="post">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Text
                    fontWeight="bold"
                    style={{ cursor: 'pointer', color: 'var(--accent)' }}
                    onClick={() => navigate(`/user/${u.id}`)}
                  >
                    {u.username}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {u.email}
                  </Text>
                  {u.role === 'admin' && (
                    <Text fontSize="xs" color="yellow.400">
                      ⭐ Admin
                    </Text>
                  )}
                </div>
                {u.role !== 'admin' && (
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={() => deleteUser(u.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* пости */}
      {tab === 'posts' && (
        <div>
          {posts.map((p) => (
            <div key={p.id} className="post">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <Text
                    fontWeight="bold"
                    fontSize="sm"
                    style={{ cursor: 'pointer', color: 'var(--accent)' }}
                    onClick={() => navigate(`/user/${p.authorId}`)}
                  >
                    {usernames[p.authorId] ?? p.authorId}
                  </Text>
                  <Text fontSize="sm">{p.content}</Text>
                  {p.repostById && (
                    <Text fontSize="xs" color="gray.500">
                      🔁 repost by {usernames[p.repostById] ?? p.repostById}
                    </Text>
                  )}
                </div>
                <Button
                  size="xs"
                  colorScheme="red"
                  onClick={() => deletePost(p.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* коментарі */}
      {tab === 'comments' && (
        <div>
          {comments.map((c) => (
            <div key={c.id} className="post">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <Text
                    fontWeight="bold"
                    fontSize="sm"
                    style={{ cursor: 'pointer', color: 'var(--accent)' }}
                    onClick={() => navigate(`/user/${c.authorId}`)}
                  >
                    {usernames[c.authorId] ?? c.authorId}
                  </Text>
                  <Text fontSize="sm">{c.content}</Text>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/post/${c.postId}`)}
                  >
                    → post {c.postId}
                  </Text>
                </div>
                <Button
                  size="xs"
                  colorScheme="red"
                  onClick={() => deleteComment(c.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AdminPanel;
