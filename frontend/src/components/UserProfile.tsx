import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Button, Text } from '@chakra-ui/react';
import type { PostType } from './pack/PostType';
import type { User } from './pack/User';
import Post from './Post';
import FollowList from './FollowList';

type Tab = 'posts' | 'reposts' | 'liked' | 'commented' | 'bookmarks';
type FollowModal = 'followers' | 'following' | null;

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isOwnProfile = currentUser?.id === id;

  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<Tab>('posts');
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followModal, setFollowModal] = useState<FollowModal>(null);

  const [allPosts, setAllPosts] = useState<PostType[]>([]);
  const [reposts, setReposts] = useState<PostType[]>([]);
  const [liked, setLiked] = useState<PostType[]>([]);
  const [commented, setCommented] = useState<PostType[]>([]);
  const [bookmarks, setBookmarks] = useState<PostType[]>([]);

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
    api.get(`/posts/commented/${id}`).then((res) => setCommented(res.data));

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
        const posts = await Promise.all(
          postIds.map((pid) => api.get(`/posts/${pid}`)),
        );
        setBookmarks(posts.map((r) => r.data));
      });
    }
  }, [id]);

  const handleFollow = async () => {
    const res = await api.post(`/users/${currentUser.id}/follow/${id}`);
    setFollowing(res.data.following);
    setFollowersCount((prev) => (res.data.following ? prev + 1 : prev - 1));
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
      case 'commented':
        return commented;
      case 'bookmarks':
        return bookmarks;
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
      case 'commented':
        return setCommented(fn);
      case 'bookmarks':
        return setBookmarks(fn);
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
        <Button size="xs" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      )}

      <div className="profile">
        <h2>{isOwnProfile ? 'My profile' : user?.username}</h2>
        <p>Username: {user?.username}</p>

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

      <div className="profile-tabs">
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

      <div style={{ marginTop: '1rem' }}>
        {currentPosts().map((p) => (
          <Post
            key={p.id}
            post={p}
            authorName={getUsername(p.authorId)}
            repostByName={p.repostById ? getUsername(p.repostById) : undefined}
            setPosts={setCurrentPosts}
          />
        ))}
        {currentPosts().length === 0 && (
          <p className="empty">Nothing here yet</p>
        )}
      </div>
    </motion.div>
  );
};

export default UserProfile;
