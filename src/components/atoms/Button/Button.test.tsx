import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('secondary');

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('ghost');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('small');

    rerender(<Button size="medium">Medium</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('medium');

    rerender(<Button size="large">Large</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('large');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with icon', () => {
    const icon = <span data-testid="test-icon">🔥</span>;
    render(<Button icon={icon}>With Icon</Button>);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders with different button types', () => {
    const { rerender } = render(<Button type="submit">Submit</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');

    rerender(<Button type="reset">Reset</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'reset');
  });

  it('applies accessibility props correctly', () => {
    render(
      <Button
        aria-label="Custom label"
        aria-controls="menu"
        aria-selected={true}
        tabIndex={-1}
        title="Tooltip text"
      >
        Accessible Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
    expect(button).toHaveAttribute('aria-controls', 'menu');
    expect(button).toHaveAttribute('aria-selected', 'true');
    expect(button).toHaveAttribute('tabindex', '-1');
    expect(button).toHaveAttribute('title', 'Tooltip text');
  });

  it('applies fullWidth class when fullWidth prop is true', () => {
    render(<Button fullWidth>Full Width Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('fullWidth');
  });

  it('handles custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<Button style={customStyle}>Styled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('background-color: red');
  });

  it('handles keyboard events', () => {
    const handleKeyDown = jest.fn();
    render(<Button onKeyDown={handleKeyDown}>Keyboard Button</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('renders with custom role', () => {
    render(<Button role="switch">Switch Button</Button>);
    const button = screen.getByRole('switch');
    expect(button).toBeInTheDocument();
  });
});