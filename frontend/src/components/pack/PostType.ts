export type PostType = {
  id: string;
  content: string;
  authorId: string;
  repostById?: string; // хто репостнув
  originalPostId?: string; // id оригінального поста
  likedBy: string[];
  repostCount: number;
  commentCount: number;
  mediaUrls?: string[];
  // createdAt: number
};
