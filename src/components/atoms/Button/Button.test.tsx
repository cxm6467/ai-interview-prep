/**
 * @fileoverview Unit tests for Button component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiUpload } from 'react-icons/fi';
import { Button } from './Button';
import styles from './Button.module.css';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders button with text content', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders button with icon and text', () => {
      render(
        <Button icon={<FiUpload data-testid="upload-icon" />}>
          Upload File
        </Button>
      );
      
      expect(screen.getByRole('button', { name: /upload file/i })).toBeInTheDocument();
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });

    it('applies correct variant classes', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass(styles.primary);

      rerender(<Button variant="secondary">Secondary</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass(styles.secondary);

      rerender(<Button variant="ghost">Ghost</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass(styles.ghost);
    });

    it('applies correct size classes', () => {
      const { rerender } = render(<Button size="small">Small</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass(styles.small);

      rerender(<Button size="medium">Medium</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass(styles.medium);

      rerender(<Button size="large">Large</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass(styles.large);
    });

    it('applies fullWidth class when specified', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(styles.fullWidth);
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Behavior', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('is keyboard accessible', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Keyboard Test</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('supports different button types', () => {
      const { rerender } = render(<Button type="button">Button</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');

      rerender(<Button type="submit">Submit</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');

      rerender(<Button type="reset">Reset</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Disabled State', () => {
    it('renders disabled button correctly', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });

    it('prevents interaction when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<Button>Accessible Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('maintains focus outline for keyboard navigation', () => {
      render(<Button>Focus Test</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
    });

    it('works with screen readers', () => {
      render(<Button>Screen Reader Test</Button>);
      const button = screen.getByRole('button', { name: /screen reader test/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('uses default props when none specified', () => {
      render(<Button>Default Props</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveClass(styles.primary); // default variant
      expect(button).toHaveClass(styles.medium);  // default size
      expect(button).not.toHaveClass(styles.fullWidth);
      expect(button).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Button>{''}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles React node children', () => {
      render(
        <Button>
          <span>Complex</span> <strong>Children</strong>
        </Button>
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Children')).toBeInTheDocument();
    });

    it('handles undefined onClick gracefully', () => {
      render(<Button>No Click Handler</Button>);
      const button = screen.getByRole('button');
      
      // Should not throw when clicked without onClick handler
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });
});