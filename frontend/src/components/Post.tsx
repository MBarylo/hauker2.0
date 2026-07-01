import { api } from '../api';
import { useState, useEffect, useRef } from 'react';
import { Button, Input, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { PostType } from './pack/PostType';
import MediaViewer from './MediaViewer';
import { createPortal } from 'react-dom';

type Props = {
  post: PostType;
  authorName: string;
  repostByName?: string; // ім'я того хто репостнув
  setPosts: any;
  isBookmarked?: boolean;
  setBookmarkedIds?: any;
};

const Post = ({
  post,
  authorName,
  repostByName,
  setPosts,
  isBookmarked,
  setBookmarkedIds,
}: Props) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!user) {
    return (
      <div className="post" style={{ cursor: 'default' }}>
        <p className="post-author">{authorName}</p>
        <p className="post-text">{post.content}</p>
      </div>
    );
  }

  const isOwner = user ? user.id === post.authorId : false;
  const isMyRepost = user ? user.id === post.repostById : false;
  const navigate = useNavigate();

  const [likedBy, setLikedBy] = useState<string[]>(post.likedBy ?? []);
  const isLiked = user ? likedBy.includes(user.id) : false;

  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState(post.content);
  const [copied, setCopied] = useState(false);

  const [bookmarked, setBookmarked] = useState(false);

  const [mediaViewerIndex, setMediaViewerIndex] = useState<number | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const [editMediaUrls, setEditMediaUrls] = useState<string[]>(
    post.mediaUrls ?? [],
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalSlots = 4 - editMediaUrls.length;
    const selected = Array.from(e.target.files ?? []).slice(0, totalSlots);
    setNewFiles(selected);
    setNewPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingMedia = (url: string) => {
    setEditMediaUrls((prev) => prev.filter((u) => u !== url));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePost = async () => {
    const formData = new FormData();
    formData.append('content', newContent);
    editMediaUrls.forEach((url) => formData.append('existingMediaUrls', url));
    newFiles.forEach((f) => formData.append('files', f));

    const res = await api.patch(`/posts/${post.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setPosts((prev: any) =>
      prev.map((p: any) => (p.id === post.id ? res.data : p)),
    );

    setEditing(false);
    setNewFiles([]);
    setNewPreviews([]);
  };

  useEffect(() => {
    setLikedBy(post.likedBy ?? []);
  }, [post.likedBy]);
  useEffect(() => {
    setEditMediaUrls(post.mediaUrls ?? []);
  }, [post.mediaUrls]);

  useEffect(() => {
    setBookmarked(isBookmarked ?? false);
  }, [isBookmarked]);

  const deletePost = async () => {
    await api.delete(`/posts/${post.id}`, {
      data: { userId: user.id },
    });

    setPosts((prev: any) =>
      prev.filter((p: any) => p.id !== post.id && p.originalPostId !== post.id),
    );
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

    // оновлюємо лічильник оригінального поста
    if (post.originalPostId) {
      const updatedOriginal = await api.get(`/posts/${post.originalPostId}`);
      setPosts((prev: any) =>
        prev.map((p: any) =>
          p.id === post.originalPostId ? updatedOriginal.data : p,
        ),
      );
    }
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

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const postId = post.originalPostId ?? post.id;
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const postId = post.originalPostId ?? post.id;
    const res = await api.post(`/users/${user.id}/bookmarks`, { postId });
    setBookmarked(res.data.bookmarked);
    setBookmarkedIds?.((prev: string[]) =>
      res.data.bookmarked
        ? [...prev, postId]
        : prev.filter((id) => id !== postId),
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

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
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

        {isOwner && !post.repostById && (
          <div
            style={{ position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="post-menu-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              ···
            </button>

            {menuOpen && (
              <div className="post-menu">
                <button
                  className="post-menu-item"
                  onClick={() => {
                    setEditing(true);
                    setMenuOpen(false);
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  className="post-menu-item post-menu-item--danger"
                  onClick={() => {
                    deletePost();
                    setMenuOpen(false);
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <>
          <Input
            size="md"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />

          {(editMediaUrls.length > 0 || newPreviews.length > 0) && (
            <div className="media-preview" onClick={(e) => e.stopPropagation()}>
              {editMediaUrls.map((url, i) => (
                <div key={`existing-${i}`} className="media-preview-item">
                  {url.match(/\.(mp4|mov|avi)$/i) ? (
                    <video src={url} />
                  ) : (
                    <img src={url} alt="" />
                  )}
                  <button
                    className="media-remove"
                    onClick={() => removeExistingMedia(url)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {newPreviews.map((src, i) => (
                <div key={`new-${i}`} className="media-preview-item">
                  {newFiles[i]?.type.startsWith('video') ? (
                    <video src={src} />
                  ) : (
                    <img src={src} alt="" />
                  )}
                  <button
                    className="media-remove"
                    onClick={() => removeNewFile(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="post-footer" onClick={(e) => e.stopPropagation()}>
            {editMediaUrls.length + newFiles.length < 4 && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => editFileInputRef.current?.click()}
              >
                📎 Add media
              </Button>
            )}
            <input
              ref={editFileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/mov,video/avi"
              multiple
              style={{ display: 'none' }}
              onChange={handleNewFiles}
            />
            <Button
              size="xs"
              onClick={() => {
                setEditing(false);
                setNewContent(post.content);
                setEditMediaUrls(post.mediaUrls ?? []);
                setNewFiles([]);
                setNewPreviews([]);
              }}
            >
              Cancel
            </Button>
            <Button size="xs" colorScheme="blue" onClick={updatePost}>
              Save
            </Button>
          </div>
        </>
      ) : (
        <p className="post-text">{post.content}</p>
      )}

      {/* окремий блок для показу медіа коли НЕ редагуємо */}
      {!editing && post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="media-grid" onClick={(e) => e.stopPropagation()}>
          {post.mediaUrls.map((url, i) =>
            url.match(/\.(mp4|mov|avi)$/i) ? (
              <video key={i} src={url} controls className="media-item" />
            ) : (
              <img
                key={i}
                src={url}
                alt=""
                className="media-item"
                style={{ cursor: 'zoom-in' }}
                onClick={() => setMediaViewerIndex(i)}
              />
            ),
          )}
        </div>
      )}

      {mediaViewerIndex !== null &&
        createPortal(
          <MediaViewer
            post={post}
            initialIndex={mediaViewerIndex}
            authorName={authorName}
            onClose={() => setMediaViewerIndex(null)}
          />,
          document.body,
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
            <Button
              size="xs"
              onClick={handleBookmark}
              variant={bookmarked ? 'solid' : 'outline'}
              colorScheme="yellow"
            >
              🔖 {bookmarked ? 'Saved' : 'Save'}
            </Button>
            <Button size="xs" onClick={handleCopyLink}>
              🔗
            </Button>
            {copied && (
              <Text fontSize="xs" color="green.400">
                ✓ Link copied
              </Text>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Post;
