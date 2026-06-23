import { api } from '../api';
import { useState } from 'react';
import { Button, Input, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { PostType } from './pack/PostType';

type Props = {
  post: PostType;
  authorName: string;
  repostByName?: string; // ім'я того хто репостнув
  setPosts: any;
};

const Post = ({ post, authorName, repostByName, setPosts }: Props) => {
  const user = JSON.parse(localStorage.getItem('user')!);
  const isOwner = user?.id === post.authorId;
  const isMyRepost = user?.id === post.repostById;
  const navigate = useNavigate();

  const [likedBy, setLikedBy] = useState<string[]>(post.likedBy ?? []);
  const isLiked = likedBy.includes(user?.id);

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

  const handleRepost = async () => {
    const res = await api.post(`/posts/${post.id}/repost`, { userId: user.id });
    const updatedOriginal = await api.get(`/posts/${post.id}`);

    setPosts((prev: any) => [
      res.data,
      ...prev.map((p: any) => (p.id === post.id ? updatedOriginal.data : p)),
    ]);
  };

  const handleDeleteRepost = async () => {
    await api.delete(`/posts/${post.id}/repost`, { data: { userId: user.id } });
    setPosts((prev: any) => prev.filter((p: any) => p.id !== post.id));
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetId = post.originalPostId ?? post.id;
    const res = await api.post(`/posts/${targetId}/like`, { userId: user.id });
    console.log('sending userId:', user.id, typeof user.id);

    setLikedBy(res.data.likedBy);

    setPosts((prev: any) =>
      prev.map((p: any) =>
        p.id === res.data.id || p.originalPostId === res.data.id
          ? { ...p, likedBy: res.data.likedBy }
          : p,
      ),
    );
  };

  return (
    <div
      className="post"
      onClick={() =>
        !editing && navigate(`/post/${post.originalPostId ?? post.id}`)
      }
    >
      {/* плашка репосту */}
      {post.repostById && (
        <Text fontSize="xs" color="gray.500" mb={1}>
          🔁 {repostByName ?? 'Someone'} reposted
        </Text>
      )}

      <p
        className="post-author"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/user/${post.authorId}`);
        }}
        style={{ cursor: 'pointer' }}
      >
        {authorName}
      </p>

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

      <div className="post-footer">
        {/* кнопка репосту — для всіх крім власника репосту */}

        {user && !isMyRepost && !post.repostById && (
          <Button
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              handleRepost();
            }}
          >
            🔁 {post.repostCount ?? ''}
          </Button>
        )}
        {/* видалити свій репост */}
        {isMyRepost && (
          <Button
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteRepost();
            }}
          >
            ✕ Remove repost
          </Button>
        )}
        {user && (
          <>
            <Button
              size="xs"
              onClick={handleLike}
              variant={isLiked ? 'solid' : 'outline'}
            >
              ❤️ {likedBy.length}
            </Button>
            <Button
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${post.originalPostId ?? post.id}`);
              }}
            >
              💬 {post.commentCount ?? 0}
            </Button>
          </>
        )}
        {isOwner && !post.repostById && !editing && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Post;
