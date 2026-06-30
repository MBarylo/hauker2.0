import { useState } from 'react';
import { api } from '../api';

type Props = {
  comment: { id: string; content: string; authorId: string };
  authorName: string;
  currentUserId?: string;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onNavigate: (userId: string) => void;
};

const CommentItem = ({
  comment,
  authorName,
  currentUserId,
  onDelete,
  onEdit,
  onNavigate,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const isOwner = currentUserId === comment.authorId;

  const handleSave = async () => {
    if (!editText.trim()) return;
    const res = await api.patch(`/comments/${comment.id}`, {
      content: editText,
      userId: currentUserId,
    });
    onEdit(comment.id, res.data.content);
    setEditing(false);
  };

  return (
    <div className="post" style={{ cursor: 'default' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <p
          className="post-author"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate(comment.authorId)}
        >
          {authorName}
        </p>

        {isOwner && (
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
                    onDelete(comment.id);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text)',
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '8px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'inherit',
              }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setEditText(comment.content);
              }}
              style={{
                flex: 1,
                padding: '8px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="post-text">{comment.content}</p>
      )}
    </div>
  );
};

export default CommentItem;
