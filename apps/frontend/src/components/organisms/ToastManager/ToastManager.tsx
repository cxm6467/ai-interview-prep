import React, { useState, useCallback, ReactNode } from 'react';
import { Toast } from '@atoms';
import { ToastContext, ToastData, ToastContextType } from './ToastContext';
import styles from './ToastManager.module.css';

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * ToastProvider Component
 * 
 * Provides toast notification functionality throughout the application.
 * Manages multiple toasts with automatic cleanup and positioning.
 * 
 * Features:
 * - Multiple toast support with auto-stacking
 * - Convenience methods for different toast types
 * - Automatic cleanup and memory management
 * - Context-based API for global access
 * 
 * @param props - The component props
 * @returns JSX element providing toast context
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = generateId();
    const newToast: ToastData = {
      id,
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    const duration = toast.duration || 4000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration + 300); // Add time for animation
  }, [generateId]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast({ message, type: 'success', duration });
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast({ message, type: 'error', duration });
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast({ message, type: 'warning', duration });
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast({ message, type: 'info', duration });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={styles.toastWrapper}
            style={{ '--toast-index': index } as React.CSSProperties}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
              isVisible={true}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};