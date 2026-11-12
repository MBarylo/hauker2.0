import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';

export type NotificationItem = {
  id: number;
  type: 'like' | 'comment' | 'follow';
  postId: string | null;
  isRead: boolean;
  createdAt: string;
  actorId: string;
  actor: string;
  post_preview: string | null;
};

export function useNotifications(userId?: string, pollMs = 30000) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const unreadRef = useRef(0);
  unreadRef.current = unread;

  const refreshCount = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/notifications/${userId}/unread-count`);
      setUnread(res.data.count);
    } catch {
      /* збій опитування не має ламати інтерфейс */
    }
  }, [userId]);

  // лічильник для бейджа: при завантаженні й раз на pollMs
  useEffect(() => {
    if (!userId) {
      setItems([]);
      setUnread(0);
      return;
    }
    refreshCount();
    const timer = setInterval(() => {
      if (!document.hidden) refreshCount();
    }, pollMs);
    return () => clearInterval(timer);
  }, [userId, pollMs, refreshCount]);

  // викликати при відкритті панелі
  const open = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.get(`/notifications/${userId}`);
      setItems(res.data); // isRead зберігається, щоб підсвітити нові в цій сесії
      if (unreadRef.current > 0) {
        await api.patch(`/notifications/${userId}/read`);
        setUnread(0);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { items, unread, loading, open, refresh: refreshCount };
}

export function notificationText(n: NotificationItem): string {
  switch (n.type) {
    case 'like':
      return `${n.actor} liked your post`;
    case 'comment':
      return `${n.actor} commented on your post`;
    case 'follow':
      return `${n.actor} started following you`;
  }
}

// куди вести клік; змініть на свій маршрут поста, якщо він є
export function notificationLink(n: NotificationItem): string {
  return `/user/${n.actorId}`;
}

export function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
