import { useMemo } from 'react'
import Post from './Post'
import { usePost } from './PostContext'
import { AnimatePresence, motion } from 'framer-motion'

const PostList = ({ searchItem }: { searchItem: string }) => {
  const { posts } = usePost()
  const filtered = useMemo(
    () =>
      posts.filter((post) =>
        post.text.toLowerCase().includes(searchItem.toLowerCase()),
      ),
    [posts, searchItem],
  )

  if (filtered.length === 0) {
    return <p className="empty">Nothing found</p>
  }
  return (
    <div className="post-list">
      <AnimatePresence>
        {filtered.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Post post={p} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default PostList
