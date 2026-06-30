import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Button, Text } from '@chakra-ui/react';
import type { PostType } from './pack/PostType';
import type { User } from './pack/User';
import Post from './Post';
import FollowList from './FollowList';
import CommentItem from './CommentsItem';
import type { Comment } from './pack/Comment';
import { useSearchParams } from 'react-router-dom';
import Toast from './Toast';

type Tab = 'posts' | 'reposts' | 'liked' | 'commented' | 'bookmarks';
type FollowModal = 'followers' | 'following' | null;

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser: { id: string; username: string; role?: string } | null =
    JSON.parse(localStorage.getItem('user') || 'null');
  const isOwnProfile = currentUser?.id === id;

  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) || 'posts';
  const setTab = (newTab: Tab) => setSearchParams({ tab: newTab });
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followModal, setFollowModal] = useState<FollowModal>(null);

  const [allPosts, setAllPosts] = useState<PostType[]>([]);
  const [reposts, setReposts] = useState<PostType[]>([]);
  const [liked, setLiked] = useState<PostType[]>([]);
  const [commented, setCommented] = useState<Comment[]>([]);
  const [bookmarks, setBookmarks] = useState<PostType[]>([]);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');

  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameText, setUsernameText] = useState('');
  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    if (user) setUsernameText(user.username ?? '');
  }, [user]);

  useEffect(() => {
    if (user) setBioText(user.bio ?? '');
  }, [user]);

  useEffect(() => {
    api.get('/users').then((usersRes) => {
      setUsers(usersRes.data);
      const found = usersRes.data.find((u: User) => u.id === id);
      setUser(found ?? null);
    });

    api.get('/posts').then((res) => {
      setAllPosts(
        res.data.filter((p: PostType) => p.authorId === id && !p.repostById),
      );
      setReposts(res.data.filter((p: PostType) => p.repostById === id));
    });

    api.get(`/posts/liked/${id}`).then((res) => setLiked(res.data));
    api.get(`/comments/by-user/${id}`).then((res) => setCommented(res.data));
    api
      .get(`/users/${id}/followers`)
      .then((res) => setFollowersCount(res.data.length));
    api
      .get(`/users/${id}/following`)
      .then((res) => setFollowingCount(res.data.length));

    if (currentUser && !isOwnProfile) {
      api
        .get(`/users/${currentUser.id}/is-following/${id}`)
        .then((res) => setFollowing(res.data.following));
    }

    if (isOwnProfile) {
      api.get(`/users/${id}/bookmarks`).then(async (res) => {
        const postIds: string[] = res.data.map((b: any) => b.postId);
        const results = await Promise.allSettled(
          postIds.map((pid) => api.get(`/posts/${pid}`)),
        );
        const validPosts = results
          .filter(
            (r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled',
          )
          .map((r) => r.value.data);
        setBookmarks(validPosts);
      });
    }
  }, [id]);

  const handleSaveUsername = async () => {
    if (!usernameText.trim() || usernameText.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    try {
      const res = await api.patch(`/users/${id}`, {
        username: usernameText.trim(),
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setEditingUsername(false);
      setUsernameError('');
    } catch (err: any) {
      setUsernameError(err.response?.data?.message || 'Username already taken');
    }
  };

  const handleSaveBio = async () => {
    const res = await api.patch(`/users/${id}`, { bio: bioText });
    setUser(res.data);
    setEditingBio(false);
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    const res = await api.post(`/users/${currentUser.id}/follow/${id}`);
    setFollowing(res.data.following);
    setFollowersCount((prev) => (res.data.following ? prev + 1 : prev - 1));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setUser(res.data);
    localStorage.setItem('user', JSON.stringify(res.data));
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/users/${id}/banner`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setUser(res.data);
  };

  const getUsername = (authorId: string) => {
    const found = users.find((u) => u.id === authorId);
    return found ? found.username : 'Unknown';
  };

  const currentPosts = () => {
    switch (tab) {
      case 'posts':
        return allPosts;
      case 'reposts':
        return reposts;
      case 'liked':
        return liked;
      case 'bookmarks':
        return bookmarks;
      default:
        return [];
    }
  };

  const setCurrentPosts = (fn: any) => {
    switch (tab) {
      case 'posts':
        return setAllPosts(fn);
      case 'reposts':
        return setReposts(fn);
      case 'liked':
        return setLiked(fn);
      case 'bookmarks':
        return setBookmarks(fn);
      default:
        return;
    }
  };

  if (!isOwnProfile && !user) return <p>Loading...</p>;
  if (isOwnProfile && !currentUser)
    return <p className="empty">You aren't logged in</p>;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'posts', label: '📝 Posts' },
    { key: 'reposts', label: '🔁 Reposts' },
    { key: 'liked', label: '❤️ Liked' },
    { key: 'commented', label: '💬 Commented' },
    ...(isOwnProfile ? [{ key: 'bookmarks' as Tab, label: '🔖 Saved' }] : []),
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {!isOwnProfile && (
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
      )}

      {/* шапка */}
      <div className="profile-banner">
        {user?.bannerUrl ? (
          <img src={user.bannerUrl} alt="banner" />
        ) : (
          <div className="profile-banner-placeholder" />
        )}
        {isOwnProfile && (
          <>
            <button
              className="profile-banner-edit"
              onClick={() => bannerInputRef.current?.click()}
            >
              📷
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleBannerUpload}
            />
          </>
        )}
      </div>

      <div className="profile">
        {/* аватар */}
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          {isOwnProfile && (
            <>
              <button
                className="profile-avatar-edit"
                onClick={() => avatarInputRef.current?.click()}
              >
                📷
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleAvatarUpload}
              />
            </>
          )}
        </div>

        {editingUsername ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              value={usernameText}
              onChange={(e) => setUsernameText(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text)',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'inherit',
                textAlign: 'center',
                outline: 'none',
                maxWidth: 220,
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSaveUsername}
                style={{
                  padding: '6px 16px',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingUsername(false);
                  setUsernameText(user?.username ?? '');
                  setUsernameError('');
                }}
                style={{
                  padding: '6px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
            </div>
            {usernameError && (
              <Toast
                message={usernameError}
                type="error"
                onClose={() => setUsernameError('')}
              />
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <h2>{user?.username}</h2>
            {isOwnProfile && (
              <button
                onClick={() => setEditingUsername(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
                title="Edit username"
              >
                ✏️
              </button>
            )}
          </div>
        )}

        {editingBio ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginTop: 12,
            }}
          >
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              maxLength={160}
              placeholder="Write something about yourself..."
              style={{
                padding: '10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text)',
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'none',
                minHeight: 60,
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                onClick={handleSaveBio}
                style={{
                  padding: '6px 16px',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingBio(false);
                  setBioText(user?.bio ?? '');
                }}
                style={{
                  padding: '6px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>
            {user?.bio ? (
              <p style={{ color: 'var(--text)', fontSize: 14 }}>{user.bio}</p>
            ) : isOwnProfile ? (
              <p
                style={{
                  color: 'var(--text-subtle)',
                  fontSize: 13,
                  fontStyle: 'italic',
                }}
              >
                No bio yet
              </p>
            ) : null}
            {isOwnProfile && (
              <button
                onClick={() => setEditingBio(true)}
                style={{
                  marginTop: 4,
                  padding: '4px 10px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'inherit',
                }}
              >
                {user?.bio ? 'Edit bio' : 'Add bio'}
              </button>
            )}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            marginTop: '8px',
          }}
        >
          <Text
            style={{ cursor: 'pointer' }}
            onClick={() => setFollowModal('followers')}
          >
            <strong>{followersCount}</strong> Followers
          </Text>
          <Text
            style={{ cursor: 'pointer' }}
            onClick={() => setFollowModal('following')}
          >
            <strong>{followingCount}</strong> Following
          </Text>
        </div>

        {!isOwnProfile && currentUser && (
          <Button
            size="sm"
            colorScheme={following ? 'gray' : 'blue'}
            onClick={handleFollow}
            style={{ marginTop: '12px' }}
          >
            {following ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </div>

      {followModal && (
        <FollowList
          userId={id!}
          type={followModal}
          onClose={() => setFollowModal(null)}
        />
      )}

      <div
        style={{
          display: 'flex',
          gap: '0',
          marginTop: '16px',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: '10px 4px',
              background: tab === t.key ? 'var(--accent)' : 'transparent',
              color: tab === t.key ? 'white' : 'var(--text-muted)',
              border: 'none',
              borderRight: '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: tab === t.key ? 600 : 400,
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="profile-posts-list" style={{ marginTop: '1rem' }}>
        {tab === 'commented' ? (
          <>
            {commented.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/post/${c.postId}`)}
                style={{ cursor: 'pointer' }}
              >
                <CommentItem
                  comment={c}
                  authorName={user?.username ?? 'Unknown'}
                  currentUserId={currentUser?.id}
                  onDelete={async (commentId) => {
                    if (!currentUser) return;
                    await api.delete(`/comments/${commentId}`, {
                      data: { userId: currentUser.id },
                    });
                    setCommented((prev) =>
                      prev.filter((cm) => cm.id !== commentId),
                    );
                  }}
                  onEdit={(commentId, content) => {
                    setCommented((prev) =>
                      prev.map((cm) =>
                        cm.id === commentId ? { ...cm, content } : cm,
                      ),
                    );
                  }}
                  onNavigate={(userId) => navigate(`/user/${userId}`)}
                />
              </div>
            ))}
            {commented.length === 0 && (
              <p className="empty">Nothing here yet</p>
            )}
          </>
        ) : (
          <>
            {currentPosts().map((p) => (
              <Post
                key={p.id}
                post={p}
                authorName={getUsername(p.authorId)}
                repostByName={
                  p.repostById ? getUsername(p.repostById) : undefined
                }
                setPosts={setCurrentPosts}
              />
            ))}
            {currentPosts().length === 0 && (
              <p className="empty">Nothing here yet</p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default UserProfile;
