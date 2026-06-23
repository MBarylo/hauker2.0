import { useEffect, useState, useMemo } from 'react';
import { api } from '../api';
import Post from './Post';
import type { User } from './pack/User';
import type { PostType } from './pack/PostType';

const PostList = ({
  posts,
  setPosts,
  searchItem,
  bookmarkedIds,
  setBookmarkedIds,
}: any) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.get('/users').then((res) => setUsers(res.data));
  }, [posts]);

  const getAuthorName = (authorId: string) => {
    const user = users.find((u) => u.id === authorId);
    return user ? user.username : 'Unknown';
  };

  const filtered = useMemo(
    () =>
      posts.filter((p: PostType) =>
        p.content.toLowerCase().includes(searchItem.toLowerCase()),
      ),
    [posts, searchItem],
  );

  return (
    <div>
      {filtered.map((p: PostType) => (
        <Post
          key={p.id}
          post={p}
          authorName={getAuthorName(p.authorId)}
          repostByName={p.repostById ? getAuthorName(p.repostById) : undefined}
          setPosts={setPosts}
          isBookmarked={bookmarkedIds.includes(p.originalPostId ?? p.id)}
          setBookmarkedIds={setBookmarkedIds}
        />
      ))}
    </div>
  );
};

export default PostList;
