import React from 'react';
import { renderHook } from '@testing-library/react';
import { useToast } from './useToast';
import { ToastContext, ToastContextType } from '../components/organisms/ToastManager/ToastContext';

describe('useToast hook', () => {
  it('should throw error when used outside ToastProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within a ToastProvider');
    
    consoleSpy.mockRestore();
  });

  it('should return context when used within ToastProvider', () => {
    const mockContext: ToastContextType = {
      showToast: jest.fn(),
      showSuccess: jest.fn(),
      showError: jest.fn(),
      showWarning: jest.fn(),
      showInfo: jest.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastContext.Provider value={mockContext}>
        {children}
      </ToastContext.Provider>
    );

    const { result } = renderHook(() => useToast(), { wrapper });

    expect(result.current).toBe(mockContext);
  });

  it('should provide access to showToast function', () => {
    const mockShowToast = jest.fn();
    const mockContext: ToastContextType = {
      showToast: mockShowToast,
      showSuccess: jest.fn(),
      showError: jest.fn(),
      showWarning: jest.fn(),
      showInfo: jest.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastContext.Provider value={mockContext}>
        {children}
      </ToastContext.Provider>
    );

    const { result } = renderHook(() => useToast(), { wrapper });

    expect(result.current.showToast).toBe(mockShowToast);
    expect(typeof result.current.showToast).toBe('function');
  });

  it('should provide access to all toast helper functions', () => {
    const mockContext: ToastContextType = {
      showToast: jest.fn(),
      showSuccess: jest.fn(),
      showError: jest.fn(),
      showWarning: jest.fn(),
      showInfo: jest.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastContext.Provider value={mockContext}>
        {children}
      </ToastContext.Provider>
    );

    const { result } = renderHook(() => useToast(), { wrapper });

    expect(typeof result.current.showSuccess).toBe('function');
    expect(typeof result.current.showError).toBe('function');
    expect(typeof result.current.showWarning).toBe('function');
    expect(typeof result.current.showInfo).toBe('function');
  });

  it('should handle null context gracefully', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastContext.Provider value={null}>
        {children}
      </ToastContext.Provider>
    );

    expect(() => {
      renderHook(() => useToast(), { wrapper });
    }).toThrow('useToast must be used within a ToastProvider');
    
    consoleSpy.mockRestore();
  });
});