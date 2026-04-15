import { api } from '../api';
import { useState } from 'react';

const Post = ({ post, authorName, setPosts }: any) => {
  const user = JSON.parse(localStorage.getItem('user')!);
  const isOwner = user?.id === post.authorId;

  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState(post.content);

  const deletePost = async () => {
    await api.delete(`/posts/${post.id}`, {
      data: { userId: user.id },
    });

    setPosts((prev: any) => prev.filter((p: any) => p.id !== post.id));
  };

  const updatePost = async () => {
    const res = await api.patch(`/posts/${post.id}`, {
      content: newContent,
    });

    setPosts((prev: any) =>
      prev.map((p: any) => (p.id === post.id ? res.data : p)),
    );

    setEditing(false);
  };

  return (
    <div className="post">
      <p>{authorName}</p>

      {editing ? (
        <>
          <input
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <button onClick={updatePost}>Save</button>
        </>
      ) : (
        <p>{post.content}</p>
      )}

      {isOwner && (
        <>
          <button onClick={() => setEditing(!editing)}>Edit</button>
          <button onClick={deletePost}>Delete</button>
        </>
      )}
    </div>
  );
};

export default Post;
