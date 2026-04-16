import { api } from '../api';
import { useState } from 'react';
import { Button, Input } from '@chakra-ui/react';

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
      <p className="post-author">{authorName}</p>

      {editing ? (
        <>
          <Input
            size="md"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />

          <div className="post-footer">
            <Button size="xs" onClick={updatePost}>
              Save
            </Button>
          </div>
        </>
      ) : (
        <p className="post-text">{post.content}</p>
      )}

      {isOwner && !editing && (
        <div className="post-footer">
          <Button size="xs" onClick={() => setEditing(!editing)}>
            Edit
          </Button>

          <Button size="xs" onClick={deletePost}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default Post;
