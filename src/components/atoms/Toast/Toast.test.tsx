import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toast } from './Toast';

// Mock timers for testing auto-dismiss functionality
jest.useFakeTimers();

describe('Toast Component', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders with default props', () => {
    render(<Toast message="Test message" />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders different toast types with correct icons', () => {
    const { rerender } = render(<Toast message="Success" type="success" />);
    expect(screen.getByText('✅')).toBeInTheDocument();

    rerender(<Toast message="Error" type="error" />);
    expect(screen.getByText('❌')).toBeInTheDocument();

    rerender(<Toast message="Warning" type="warning" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();

    rerender(<Toast message="Info" type="info" />);
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('applies correct CSS classes for different types', () => {
    const { rerender } = render(<Toast message="Test" type="success" />);
    let toast = screen.getByRole('alert');
    expect(toast).toHaveClass('success');

    rerender(<Toast message="Test" type="error" />);
    toast = screen.getByRole('alert');
    expect(toast).toHaveClass('error');

    rerender(<Toast message="Test" type="warning" />);
    toast = screen.getByRole('alert');
    expect(toast).toHaveClass('warning');

    rerender(<Toast message="Test" type="info" />);
    toast = screen.getByRole('alert');
    expect(toast).toHaveClass('info');
  });

  it('handles manual close button click', () => {
    const onClose = jest.fn();
    render(<Toast message="Test message" onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close notification/i });
    fireEvent.click(closeButton);

    // Component should trigger close after animation delay
    jest.advanceTimersByTime(300);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after specified duration', () => {
    const onClose = jest.fn();
    render(<Toast message="Auto dismiss" duration={2000} onClose={onClose} />);

    // Initially visible
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();

    // Fast-forward time to just before auto-dismiss
    jest.advanceTimersByTime(1999);
    expect(onClose).not.toHaveBeenCalled();

    // Fast-forward to trigger auto-dismiss
    jest.advanceTimersByTime(1);
    
    // Additional time for close animation
    jest.advanceTimersByTime(300);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not auto-dismiss when duration is 0', () => {
    const onClose = jest.fn();
    render(<Toast message="No auto dismiss" duration={0} onClose={onClose} />);

    // Fast-forward a long time
    jest.advanceTimersByTime(10000);
    
    expect(screen.getByText('No auto dismiss')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('responds to isVisible prop changes', () => {
    const { rerender } = render(<Toast message="Test" isVisible={true} />);
    expect(screen.getByText('Test')).toBeInTheDocument();

    rerender(<Toast message="Test" isVisible={false} />);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Toast message="Accessible toast" />);
    
    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    
    const icon = screen.getByText('ℹ️');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    
    const closeButton = screen.getByRole('button');
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
  });

  it('renders without onClose callback', () => {
    render(<Toast message="No callback" />);
    
    const closeButton = screen.getByRole('button', { name: /close notification/i });
    
    // Should not throw when clicking close without callback
    expect(() => fireEvent.click(closeButton)).not.toThrow();
  });

  it('applies show class when visible', () => {
    render(<Toast message="Visible toast" isVisible={true} />);
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('show');
  });

  it('clears timer on unmount', () => {
    const onClose = jest.fn();
    const { unmount } = render(<Toast message="Test" duration={2000} onClose={onClose} />);
    
    // Unmount before auto-dismiss
    unmount();
    
    // Fast-forward past the duration
    jest.advanceTimersByTime(2000);
    jest.advanceTimersByTime(300);
    
    // Should not call onClose since component was unmounted
    expect(onClose).not.toHaveBeenCalled();
  });

  it('handles quick successive isVisible changes', () => {
    const { rerender } = render(<Toast message="Test" isVisible={false} />);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();

    rerender(<Toast message="Test" isVisible={true} />);
    expect(screen.getByText('Test')).toBeInTheDocument();

    rerender(<Toast message="Test" isVisible={false} />);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });
});