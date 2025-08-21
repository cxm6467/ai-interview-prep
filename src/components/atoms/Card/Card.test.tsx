import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>);
    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<Card>Default card</Card>);
    const card = screen.getByText('Default card');
    expect(card).toHaveClass('card');
    expect(card).toHaveClass('default');
    expect(card).toHaveClass('padding-medium');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Card variant="default">Default variant</Card>);
    let card = screen.getByText('Default variant');
    expect(card).toHaveClass('default');

    rerender(<Card variant="elevated">Elevated variant</Card>);
    card = screen.getByText('Elevated variant');
    expect(card).toHaveClass('elevated');

    rerender(<Card variant="outlined">Outlined variant</Card>);
    card = screen.getByText('Outlined variant');
    expect(card).toHaveClass('outlined');
  });

  it('renders with different padding options', () => {
    const { rerender } = render(<Card padding="none">No padding</Card>);
    let card = screen.getByText('No padding');
    expect(card).toHaveClass('padding-none');

    rerender(<Card padding="small">Small padding</Card>);
    card = screen.getByText('Small padding');
    expect(card).toHaveClass('padding-small');

    rerender(<Card padding="medium">Medium padding</Card>);
    card = screen.getByText('Medium padding');
    expect(card).toHaveClass('padding-medium');

    rerender(<Card padding="large">Large padding</Card>);
    card = screen.getByText('Large padding');
    expect(card).toHaveClass('padding-large');
  });

  it('applies custom className', () => {
    render(<Card className="custom-card-class">Custom class</Card>);
    const card = screen.getByText('Custom class');
    expect(card).toHaveClass('custom-card-class');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Clickable card</Card>);
    
    const card = screen.getByText('Clickable card');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies clickable class when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Clickable card</Card>);
    
    const card = screen.getByText('Clickable card');
    expect(card).toHaveClass('clickable');
  });

  it('does not apply clickable class when onClick is not provided', () => {
    render(<Card>Non-clickable card</Card>);
    
    const card = screen.getByText('Non-clickable card');
    expect(card).not.toHaveClass('clickable');
  });

  it('renders complex children correctly', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card description</p>
        <button>Action Button</button>
      </Card>
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Card Title');
    expect(screen.getByText('Card description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
  });

  it('combines all props correctly', () => {
    const handleClick = jest.fn();
    render(
      <Card
        variant="elevated"
        padding="large"
        className="custom-card"
        onClick={handleClick}
      >
        Combined props card
      </Card>
    );

    const card = screen.getByText('Combined props card');
    expect(card).toHaveClass('card');
    expect(card).toHaveClass('elevated');
    expect(card).toHaveClass('padding-large');
    expect(card).toHaveClass('clickable');
    expect(card).toHaveClass('custom-card');

    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as a div element', () => {
    const { container } = render(<Card>Semantic content</Card>);
    const cardContent = screen.getByText('Semantic content');
    expect(cardContent).toBeInTheDocument();
    expect(container.firstChild?.nodeName.toLowerCase()).toBe('div');
  });
});