// Atomic Design - Organisms Barrel Export
// Complex UI sections composed of groups of molecules

export { Footer } from './Footer';
export { InterviewChat } from './InterviewChat';
export { ToastProvider, useToast } from './ToastManager';

// Re-export types if needed
export type { ToastData } from './ToastManager/ToastContext';