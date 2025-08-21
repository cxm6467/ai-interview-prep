import { createContext } from 'react';

export interface ToastData {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);