import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '../api';

type User = {
  id: string;
  username: string;
};

type Post = {
  id: string;
  content: string;
  authorId: string;
};

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      api.get('/posts').then((res) => {
        const userPosts = res.data.filter(
          (p: Post) => p.authorId === parsed.id,
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
