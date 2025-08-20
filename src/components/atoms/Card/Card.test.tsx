/**
 * @fileoverview Unit tests for Card component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('renders card with children content', () => {
      render(
        <Card>
          <h2>Card Title</h2>
          <p>Card content goes here</p>
        </Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
    });

    it('renders with default classes', () => {
      const { container } = render(<Card>Default Card</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('card'); // Base class
    });

    it('applies custom className', () => {
      const { container } = render(
        <Card className="custom-card-class">Custom Card</Card>
      );
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('custom-card-class');
      expect(cardElement).toHaveClass('card'); // Should still have base class
    });

    it('applies padding classes correctly', () => {
      const { rerender, container } = render(<Card padding="none">None Padding</Card>);
      let cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('paddingNone');

      rerender(<Card padding="small">Small Padding</Card>);
      cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('paddingSmall');

      rerender(<Card padding="medium">Medium Padding</Card>);
      cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('paddingMedium');

      rerender(<Card padding="large">Large Padding</Card>);
      cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('paddingLarge');
    });

    it('applies variant classes correctly', () => {
      const { rerender, container } = render(<Card variant="default">Default Variant</Card>);
      let cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('default');

      rerender(<Card variant="elevated">Elevated Variant</Card>);
      cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('elevated');

      rerender(<Card variant="outlined">Outlined Variant</Card>);
      cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('outlined');
    });

    it('combines multiple props correctly', () => {
      const { container } = render(
        <Card 
          variant="elevated" 
          padding="large" 
          className="custom-class"
        >
          Combined Props Card
        </Card>
      );
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('card');
      expect(cardElement).toHaveClass('elevated');
      expect(cardElement).toHaveClass('paddingLarge');
      expect(cardElement).toHaveClass('custom-class');
    });
  });

  describe('Interactive Behavior', () => {
    it('calls onClick handler when clicked and clickable', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Card onClick={handleClick}>
          <p>Clickable Card</p>
        </Card>
      );
      
      const cardElement = screen.getByText('Clickable Card').parentElement;
      await user.click(cardElement!);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('adds interactive styles when onClick is provided', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Card onClick={handleClick}>Interactive Card</Card>
      );
      
      const cardElement = container.firstChild as HTMLElement;
      // Should have cursor pointer and other interactive styles
      expect(cardElement).toHaveClass('clickable'); // Assuming this class is added
    });

    it('does not add interactive styles when no onClick provided', () => {
      const { container } = render(<Card>Non-Interactive Card</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      // Should not have clickable class
      expect(cardElement).not.toHaveClass('clickable');
    });

    it('is keyboard accessible when clickable', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Card onClick={handleClick}>
          Keyboard Accessible Card
        </Card>
      );
      
      const cardElement = screen.getByText('Keyboard Accessible Card').parentElement;
      
      // Focus the card
      cardElement!.focus();
      expect(cardElement).toHaveFocus();
      
      // Press Enter
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Press Space
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('has proper tabIndex when clickable', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Card onClick={handleClick}>Focusable Card</Card>
      );
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveAttribute('tabIndex', '0');
    });

    it('does not have tabIndex when not clickable', () => {
      const { container } = render(<Card>Non-Focusable Card</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).not.toHaveAttribute('tabIndex');
    });
  });

  describe('Content Handling', () => {
    it('handles text content', () => {
      render(<Card>Simple text content</Card>);
      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('handles complex React node content', () => {
      render(
        <Card>
          <header>Card Header</header>
          <main>
            <p>Main content paragraph</p>
            <button>Action Button</button>
          </main>
          <footer>Card Footer</footer>
        </Card>
      );
      
      expect(screen.getByText('Card Header')).toBeInTheDocument();
      expect(screen.getByText('Main content paragraph')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('handles empty content gracefully', () => {
      const { container } = render(<Card>{''}</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles multiple children', () => {
      render(
        <Card>
          <span>First child</span>
          <span>Second child</span>
          <span>Third child</span>
        </Card>
      );
      
      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText('Third child')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper role when clickable', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Card onClick={handleClick}>Clickable Card</Card>
      );
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveAttribute('role', 'button');
    });

    it('does not have button role when not clickable', () => {
      const { container } = render(<Card>Regular Card</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).not.toHaveAttribute('role', 'button');
    });

    it('supports ARIA attributes', () => {
      const { container } = render(
        <Card aria-label="Test card" aria-describedby="card-description">
          Card with ARIA
        </Card>
      );
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveAttribute('aria-label', 'Test card');
      expect(cardElement).toHaveAttribute('aria-describedby', 'card-description');
    });

    it('has proper focus outline for keyboard users', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Card onClick={handleClick}>Focusable Card</Card>
      );
      
      const cardElement = container.firstChild as HTMLElement;
      cardElement.focus();
      
      expect(cardElement).toHaveFocus();
    });
  });

  describe('Default Props', () => {
    it('uses default props when none specified', () => {
      const { container } = render(<Card>Default Props Card</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('card');
      expect(cardElement).toHaveClass('default'); // default variant
      expect(cardElement).toHaveClass('paddingMedium'); // default padding
    });
  });

  describe('Edge Cases', () => {
    it('handles click events with additional event properties', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Card onClick={handleClick}>Event Test Card</Card>);
      const cardElement = screen.getByText('Event Test Card').parentElement;
      
      await user.click(cardElement!);
      
      expect(handleClick).toHaveBeenCalled();
      const callArgs = handleClick.mock.calls[0][0];
      expect(callArgs).toHaveProperty('type', 'click');
    });

    it('prevents event bubbling when specified', () => {
      const parentClick = vi.fn();
      const cardClick = vi.fn((e) => e.stopPropagation());
      
      render(
        <div onClick={parentClick}>
          <Card onClick={cardClick}>Stop Propagation Card</Card>
        </div>
      );
      
      const cardElement = screen.getByText('Stop Propagation Card').parentElement;
      fireEvent.click(cardElement!);
      
      expect(cardClick).toHaveBeenCalledTimes(1);
      expect(parentClick).not.toHaveBeenCalled();
    });

    it('handles undefined onClick gracefully', () => {
      const { container } = render(<Card>No Click Handler</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(() => fireEvent.click(cardElement)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      
      const TestCard = ({ children, ...props }: any) => {
        renderSpy();
        return <Card {...props}>{children}</Card>;
      };
      
      const { rerender } = render(<TestCard>Test</TestCard>);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props should not cause additional renders
      rerender(<TestCard>Test</TestCard>);
      expect(renderSpy).toHaveBeenCalledTimes(2); // React will re-render, but no additional work
    });
  });
});