import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '../api';
import type { PostType } from './pack/PostType';
import type { User } from './pack/User';

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      api.get('/posts').then((res) => {
        const userPosts = res.data.filter(
          (p: PostType) =>
            p.authorId === parsed.id || p.repostById === parsed.id,
        );
        setPosts(userPosts);
      });
    }
  }, []);

  if (!user) {
    return <p className="empty">You aren't logged in</p>;
  }

  return (
    <motion.div
      className="profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2>My profile</h2>

      <p>Username: {user.username}</p>
      <p>Posts: {posts.length}</p>
    </motion.div>
  );
};

export default Profile;
