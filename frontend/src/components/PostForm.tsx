import { useState, useRef, useEffect } from 'react'
import { usePost } from './PostContext'
import { motion } from 'framer-motion'
import PostList from './PostList'
import type { FormEvent } from 'react'

const PostForm = () => {
  const { addPost } = usePost()
  const [text, setText] = useState('')
  const [searchItem, setSearchItem] = useState<string>('')

  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (text.trim() === '') return
    addPost(text)
    setText('')
  }
  return (
    <div>
      <motion.form
        className="post-form"
        onSubmit={submit}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <input
          value={searchItem}
          type="text"
          onChange={(e) => setSearchItem(e.target.value)}
          placeholder="Search post..."
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's new?"
          ref={inputRef}
        />
        <button type="submit">Post</button>
      </motion.form>
      <PostList searchItem={searchItem} />
    </div>
  )
}

export default PostForm
