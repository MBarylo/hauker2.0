import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
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

const dangerBtn: React.CSSProperties = {
  padding: '6px 12px',
  background: 'rgba(248, 81, 73, 0.1)',
  border: '1px solid var(--danger)',
  borderRadius: '8px',
  color: 'var(--danger)',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s ease',
};

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
      {/* заголовок */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
          ⚙️ Admin Panel
        </h2>
      </div>

      {/* таби */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          marginBottom: '16px',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {tabs.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: '10px 4px',
              background: tab === t.key ? 'var(--accent)' : 'transparent',
              color: tab === t.key ? 'white' : 'var(--text-muted)',
              border: 'none',
              borderRight:
                i < tabs.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: tab === t.key ? 600 : 400,
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            {t.label}
          </button>
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
                  <p
                    style={{
                      fontWeight: 600,
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      marginBottom: 2,
                    }}
                    onClick={() => navigate(`/user/${u.id}`)}
                  >
                    {u.username}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {u.email}
                  </p>
                  {u.role === 'admin' && (
                    <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 2 }}>
                      ⭐ Admin
                    </p>
                  )}
                </div>
                {u.role !== 'admin' && (
                  <button style={dangerBtn} onClick={() => deleteUser(u.id)}>
                    Delete
                  </button>
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
                  gap: 8,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      marginBottom: 4,
                    }}
                    onClick={() => navigate(`/user/${p.authorId}`)}
                  >
                    {usernames[p.authorId] ?? p.authorId}
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text)' }}>
                    {p.content}
                  </p>
                  {p.mediaUrls && p.mediaUrls.length > 0 && (
                    <div className="media-grid" style={{ marginTop: 8 }}>
                      {p.mediaUrls.map((url, i) =>
                        url.match(/\.(mp4|mov|avi)$/i) ? (
                          <video
                            key={i}
                            src={url}
                            controls
                            className="media-item"
                          />
                        ) : (
                          <img
                            key={i}
                            src={url}
                            alt=""
                            className="media-item"
                            style={{ cursor: 'zoom-in' }}
                          />
                        ),
                      )}
                    </div>
                  )}
                  {p.repostById && (
                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginTop: 4,
                      }}
                    >
                      🔁 repost by {usernames[p.repostById] ?? p.repostById}
                    </p>
                  )}
                </div>
                <button style={dangerBtn} onClick={() => deletePost(p.id)}>
                  Delete
                </button>
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
                  gap: 8,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      marginBottom: 4,
                    }}
                    onClick={() => navigate(`/user/${c.authorId}`)}
                  >
                    {usernames[c.authorId] ?? c.authorId}
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text)' }}>
                    {c.content}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      marginTop: 4,
                    }}
                    onClick={() => navigate(`/post/${c.postId}`)}
                  >
                    → post {c.postId}
                  </p>
                </div>
                <button style={dangerBtn} onClick={() => deleteComment(c.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AdminPanel;
