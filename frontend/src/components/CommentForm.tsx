import { usePost } from './PostContext'
import { useState } from 'react'
import type { FormEvent } from 'react'

const CommentForm = ({ postId }: { postId: number }) => {
  const { addComment } = usePost()
  const [text, setText] = useState<string>('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (text.trim() === '') return
    addComment(postId, text)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <input
        type="text"
        placeholder="Type a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  )
}

export default CommentForm
