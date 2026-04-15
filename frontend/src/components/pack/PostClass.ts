import type PostComment from './PostComment'

export default interface PostClass {
  id: number
  author: string
  text: string
  likes: number
  comments: PostComment[]
  createdAt: number
}
