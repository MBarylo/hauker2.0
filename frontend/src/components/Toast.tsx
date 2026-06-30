import { useEffect } from 'react';

type Props = {
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
};

const Toast = ({ message, type = 'error', onClose }: Props) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    error: {
      bg: 'rgba(248, 81, 73, 0.15)',
      border: 'var(--danger)',
      text: 'var(--danger)',
      icon: '⚠️',
    },
    success: {
      bg: 'rgba(63, 185, 80, 0.15)',
      border: 'var(--success)',
      text: 'var(--success)',
      icon: '✓',
    },
    info: {
      bg: 'var(--accent-muted)',
      border: 'var(--accent)',
      text: 'var(--accent)',
      icon: 'ℹ️',
    },
  };

  const c = colors[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '10px',
        padding: '12px 18px',
        color: c.text,
        fontSize: '14px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 1000,
        boxShadow: 'var(--shadow)',
        backdropFilter: 'blur(8px)',
        maxWidth: '90vw',
        animation: 'toastIn 0.2s ease',
      }}
    >
      <span>{c.icon}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: c.text,
          cursor: 'pointer',
          fontSize: '16px',
          marginLeft: '8px',
          opacity: 0.7,
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
