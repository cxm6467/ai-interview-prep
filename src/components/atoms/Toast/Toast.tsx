import React, { useState, useEffect } from 'react';
import styles from './Toast.module.css';

export interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
  isVisible?: boolean;
}

/**
 * Toast Component
 * 
 * A notification component that displays temporary messages to users.
 * Auto-dismisses after a specified duration with smooth animations.
 * 
 * Features:
 * - Multiple toast types (success, info, warning, error)
 * - Customizable duration
 * - Auto-dismiss functionality
 * - Smooth enter/exit animations
 * - Manual close option
 * 
 * @param props - The component props
 * @returns JSX element representing a toast notification
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
  isVisible = true
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose?.(), 300);
  };

  if (!show) {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <div 
      className={`${styles.toast} ${styles[type]} ${show ? styles.show : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          {getIcon()}
        </span>
        <span className={styles.message}>
          {message}
        </span>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};