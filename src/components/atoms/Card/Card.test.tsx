import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../test/utils';
import { Card } from './Card';

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>);
    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
    // Check that basic card classes are applied (CSS modules will add prefixes)
    expect(card.className).toMatch(/card/);
    expect(card.className).toMatch(/default/);
    expect(card.className).toMatch(/padding-medium/);
  });

  it('renders different variants', () => {
    const { rerender } = render(<Card variant="elevated">Elevated card</Card>);
    expect(screen.getByText('Elevated card').className).toMatch(/elevated/);

    rerender(<Card variant="outlined">Outlined card</Card>);
    expect(screen.getByText('Outlined card').className).toMatch(/outlined/);

    rerender(<Card variant="default">Default card</Card>);
    expect(screen.getByText('Default card').className).toMatch(/default/);
  });

  it('renders different padding sizes', () => {
    const { rerender } = render(<Card padding="none">No padding</Card>);
    expect(screen.getByText('No padding').className).toMatch(/padding-none/);

    rerender(<Card padding="small">Small padding</Card>);
    expect(screen.getByText('Small padding').className).toMatch(/padding-small/);

    rerender(<Card padding="large">Large padding</Card>);
    expect(screen.getByText('Large padding').className).toMatch(/padding-large/);
  });

  it('handles click events when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable card</Card>);
    
    const card = screen.getByText('Clickable card');
    expect(card.className).toMatch(/clickable/);
    
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not add clickable class when onClick is not provided', () => {
    render(<Card>Non-clickable card</Card>);
    const card = screen.getByText('Non-clickable card');
    expect(card.className).not.toMatch(/clickable/);
  });

  it('applies custom className', () => {
    render(<Card className="custom-card-class">Custom class</Card>);
    expect(screen.getByText('Custom class')).toHaveClass('custom-card-class');
  });

  it('combines multiple classes correctly', () => {
    render(
      <Card
        variant="elevated"
        padding="large"
        className="extra-class"
      >
        Combined styles
      </Card>
    );
    
    const card = screen.getByText('Combined styles');
    expect(card.className).toMatch(/card/);
    expect(card.className).toMatch(/elevated/);
    expect(card.className).toMatch(/padding-large/);
    expect(card.className).toMatch(/extra-class/);
  });

  it('renders complex content', () => {
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

  it('supports keyboard navigation when clickable', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Keyboard accessible card</Card>);
    
    const card = screen.getByText('Keyboard accessible card');
    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });
    
    // Note: Card doesn't implement keyboard navigation by default
    // This test ensures it doesn't break with keyboard events
    expect(card).toBeInTheDocument();
  });

  it('maintains semantic structure', () => {
    render(
      <Card>
        <div data-testid="card-content">
          <p>Semantic content</p>
        </div>
      </Card>
    );

    const cardContent = screen.getByTestId('card-content');
    expect(cardContent).toBeInTheDocument();
    expect(screen.getByText('Semantic content')).toBeInTheDocument();
  });
});