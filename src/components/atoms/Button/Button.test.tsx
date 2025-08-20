import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../test/utils';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    // Check that basic button classes are applied (CSS modules will add prefixes)
    expect(button.className).toMatch(/button/);
    expect(button.className).toMatch(/primary/);
    expect(button.className).toMatch(/medium/);
  });

  it('renders different variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button').className).toMatch(/secondary/);

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button').className).toMatch(/ghost/);
  });

  it('renders different sizes', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    expect(screen.getByRole('button').className).toMatch(/small/);

    rerender(<Button size="large">Large</Button>);
    expect(screen.getByRole('button').className).toMatch(/large/);
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with fullWidth class', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button').className).toMatch(/fullWidth/);
  });

  it('renders with icon', () => {
    render(<Button icon="🔥">With Icon</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('🔥');
    expect(button).toHaveTextContent('With Icon');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('handles different button types', () => {
    const { rerender } = render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

    rerender(<Button type="reset">Reset</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
  });

  it('supports accessibility attributes', () => {
    render(
      <Button
        aria-label="Custom label"
        aria-controls="menu"
        aria-selected={true}
        role="menuitem"
        tabIndex={-1}
        title="Tooltip text"
      >
        Accessible Button
      </Button>
    );

    const button = screen.getByRole('menuitem');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
    expect(button).toHaveAttribute('aria-controls', 'menu');
    expect(button).toHaveAttribute('aria-selected', 'true');
    expect(button).toHaveAttribute('tabindex', '-1');
    expect(button).toHaveAttribute('title', 'Tooltip text');
  });

  it('handles keyboard events', () => {
    const handleKeyDown = vi.fn();
    render(<Button onKeyDown={handleKeyDown}>Keyboard</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }));
  });

  it('handles click interactions', () => {
    render(<Button>Interactive Test</Button>);
    const button = screen.getByRole('button');
    
    // Test that button is clickable and interactive
    fireEvent.click(button);
    expect(button).toBeInTheDocument();
    
    // Test that button responds to focus
    button.focus();
    expect(button).toHaveFocus();
  });
});