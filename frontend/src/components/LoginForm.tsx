import { usePost } from './PostContext'
import { useState, useRef, useEffect } from 'react'

const LoginForm = () => {
  const { login } = usePost()
  const [value, setValue] = useState('')

  const ref = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    ref.current?.focus()
  })

  return (
    <div className="login-form">
      <input
        placeholder="Enter name..."
        value={value}
        ref={ref}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={() => login(value)}>Login</button>
    </div>
  )
}

export default LoginForm
