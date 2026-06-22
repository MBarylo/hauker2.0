import { api } from '../api';
import { useState } from 'react';
import { Button, Input } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Post = ({ post, authorName, setPosts }: any) => {
  const user = JSON.parse(localStorage.getItem('user')!);
  const isOwner = user?.id === post.authorId;
  const navigate = useNavigate();

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
    <div
      className="post"
      onClick={() => !editing && navigate(`/post/${post.id}`)}
    >
      <p className="post-author">{authorName}</p>

      {editing ? (
        <>
          <Input
            size="md"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="post-footer">
            <Button
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                updatePost();
              }}
            >
              Save
            </Button>
          </div>
        </>
      ) : (
        <p className="post-text">{post.content}</p>
      )}

      {isOwner && !editing && (
        <div className="post-footer">
          <Button
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              deletePost();
            }}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default Post;
