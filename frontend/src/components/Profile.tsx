import { motion } from 'framer-motion'
import { usePost } from './PostContext'

const Profile = () => {
  const { posts, currentUser } = usePost()

  if (!currentUser) {
    return <p className="empty">You aren't entered yet</p>
  }

  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0)
  return (
    <motion.div
      className="profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2>My profile</h2>
      <div
        className="avatar"
        dangerouslySetInnerHTML={{ __html: currentUser.photo }}
      />
      <p>Author: {currentUser.name}</p>
      <p>Posts: {posts.length}</p>
      <p>Likes: {totalLikes}</p>
    </motion.div>
  )
}

export default Profile
