import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsContext } from './NotificationsProvider';
import { notificationLink, timeAgo } from '../hooks/useNotifications';

const ICONS = { like: '❤️', comment: '💬', follow: '👤' } as const;
const ACTIONS = {
  like: 'liked your post',
  comment: 'commented on your post',
  follow: 'started following you',
} as const;

const NotificationsPage = () => {
  const { items, loading, open } = useNotificationsContext();
  const navigate = useNavigate();

  // при відкритті сторінки: завантажити список і позначити все прочитаним
  useEffect(() => {
    open();
  }, [open]);

  return (
    <div>
      <h2 className="notif-title">Notifications</h2>

      {loading && items.length === 0 && <p className="empty">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="empty">No notifications yet</p>
      )}

      <div className="notif-list">
        {items.map((n) => (
          <div
            key={n.id}
            className={`notif-item${n.isRead ? '' : ' notif-new'}`}
            onClick={() => navigate(notificationLink(n))}
          >
            <span className="notif-icon">{ICONS[n.type]}</span>
            <div className="notif-body">
              <p className="notif-text">
                <strong>{n.actor}</strong> {ACTIONS[n.type]}
              </p>
              {n.post_preview && (
                <p className="notif-preview">“{n.post_preview}”</p>
              )}
              <p className="notif-time">{timeAgo(n.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
