//import type PostComment from './PostComment'

export type PostType = {
  id: string;
  content: string;
  authorId: string;
  repostById?: string; // хто репостнув
  originalPostId?: string; // id оригінального поста
  // likes: number
  // comments: PostComment[]
  // createdAt: number
};
