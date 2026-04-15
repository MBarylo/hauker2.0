import { useState } from 'react'
import { usePost } from './PostContext'
import { motion } from 'framer-motion'
import CommentForm from './CommentForm'
import type PostClass from './pack/PostClass'

const Post = ({ post }: { post: PostClass }) => {
  const { removePost, likePost, removeComment } = usePost()
  const [like, setLike] = useState(false)
  const [showComments, setShowComments] = useState(false) // стан для показу коментарів

  const clickLike = () => {
    setLike(true)
    likePost(post.id)
    setTimeout(() => setLike(false), 300)
  }

  return (
    <motion.div
      className="post"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <p className="post-author">{post.author}</p>
      <p className="post-text">{post.text}</p>
      <p className="post-time">
        🕒 {post.createdAt ? new Date(post.createdAt).toLocaleString() : '—'}
      </p>

      <div className="post-footer">
        <motion.button
          type="button"
          className="like-btn"
          onClick={clickLike}
          animate={{ scale: like ? 1.5 : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 10 }}
        >
          ❤️ {post.likes}
        </motion.button>

        <button
          type="button"
          className="delete-btn"
          onClick={() => removePost(post.id)}
        >
          Delete
        </button>
      </div>

      {/* Кнопка показу/приховування коментарів */}
      <button
        type="button"
        className="open-comments-btn"
        onClick={() => setShowComments((prev) => !prev)}
      >
        {showComments ? 'Hide comments' : 'Open comments'}
      </button>

      {/* Коментарі */}
      <div className={`comments ${showComments ? 'show' : ''}`}>
        {post.comments.map((c) => (
          <div key={c.id} className="comment">
            <span>
              {new Date(c.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              {c.author}: {c.text}
            </span>

            <button type="button" onClick={() => removeComment(post.id, c.id)}>
              ✖
            </button>
          </div>
        ))}

        {/* Форма коментаря під постом */}
        <CommentForm postId={post.id} />
      </div>
    </motion.div>
  )
}

export default Post
