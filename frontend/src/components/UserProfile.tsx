import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Button } from '@chakra-ui/react';
import type { PostType } from './pack/PostType';
import type { User } from './pack/User';
import Post from './Post';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isOwnProfile = currentUser?.id === id;

  console.log('currentUser.id:', currentUser?.id);
  console.log('id from params:', id);
  console.log('isOwnProfile:', isOwnProfile);

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.get('/users').then((usersRes) => {
      setUsers(usersRes.data);
      const found = usersRes.data.find((u: User) => u.id === id);
      setUser(found ?? null);

      api.get('/posts').then((postsRes) => {
        const userPosts = postsRes.data.filter(
          (p: PostType) => p.authorId === id || p.repostById === id,
        );
        setPosts(userPosts);
      });
    });
  }, [id]);

  const getUsername = (authorId: string) => {
    const found = users.find((u) => u.id === authorId);
    return found ? found.username : 'Unknown';
  };

  if (!isOwnProfile && !user) return <p>Loading...</p>;

  if (isOwnProfile && !currentUser) {
    return <p className="empty">You aren't logged in</p>;
  }

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
        <p>Posts: {posts.length}</p>
      </div>

      <div style={{ marginTop: '1rem' }}>
        {posts.map((p) => (
          <Post
            key={p.id}
            post={p}
            authorName={getUsername(p.authorId)}
            repostByName={p.repostById ? getUsername(p.repostById) : undefined}
            setPosts={setPosts}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default UserProfile;
