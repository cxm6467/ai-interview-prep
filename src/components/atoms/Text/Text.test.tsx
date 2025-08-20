import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/utils';
import { Text } from './Text';

describe('Text', () => {
  it('renders with default props', () => {
    render(<Text>Default text</Text>);
    const text = screen.getByText('Default text');
    expect(text).toBeInTheDocument();
    expect(text.className).toMatch(/text/);
    expect(text.className).toMatch(/body/);
  });

  it('renders different variants with correct HTML tags', () => {
    const { rerender } = render(<Text variant="h1">Heading 1</Text>);
    let element = screen.getByRole('heading', { level: 1 });
    expect(element).toBeInTheDocument();
    expect(element.className).toMatch(/h1/);

    rerender(<Text variant="h2">Heading 2</Text>);
    element = screen.getByRole('heading', { level: 2 });
    expect(element.className).toMatch(/h2/);

    rerender(<Text variant="h3">Heading 3</Text>);
    element = screen.getByRole('heading', { level: 3 });
    expect(element.className).toMatch(/h3/);

    rerender(<Text variant="body">Body text</Text>);
    element = screen.getByText('Body text');
    expect(element.tagName).toBe('P');
    expect(element.className).toMatch(/body/);

    rerender(<Text variant="small">Small text</Text>);
    element = screen.getByText('Small text');
    expect(element.tagName).toBe('P');
    expect(element.className).toMatch(/small/);

    rerender(<Text variant="caption">Caption text</Text>);
    element = screen.getByText('Caption text');
    expect(element.tagName).toBe('P');
    expect(element.className).toMatch(/caption/);
  });

  it('applies color classes', () => {
    const { rerender } = render(<Text color="primary">Primary color</Text>);
    expect(screen.getByText('Primary color').className).toMatch(/color-primary/);

    rerender(<Text color="secondary">Secondary color</Text>);
    expect(screen.getByText('Secondary color').className).toMatch(/color-secondary/);

    rerender(<Text color="tertiary">Tertiary color</Text>);
    expect(screen.getByText('Tertiary color').className).toMatch(/color-tertiary/);

    rerender(<Text color="accent">Accent color</Text>);
    expect(screen.getByText('Accent color').className).toMatch(/color-accent/);
  });

  it('applies alignment classes', () => {
    const { rerender } = render(<Text align="left">Left aligned</Text>);
    expect(screen.getByText('Left aligned').className).toMatch(/align-left/);

    rerender(<Text align="center">Center aligned</Text>);
    expect(screen.getByText('Center aligned').className).toMatch(/align-center/);

    rerender(<Text align="right">Right aligned</Text>);
    expect(screen.getByText('Right aligned').className).toMatch(/align-right/);
  });

  it('applies weight classes', () => {
    const { rerender } = render(<Text weight="normal">Normal weight</Text>);
    expect(screen.getByText('Normal weight').className).toMatch(/weight-normal/);

    rerender(<Text weight="medium">Medium weight</Text>);
    expect(screen.getByText('Medium weight').className).toMatch(/weight-medium/);

    rerender(<Text weight="bold">Bold weight</Text>);
    expect(screen.getByText('Bold weight').className).toMatch(/weight-bold/);
  });

  it('applies custom className', () => {
    render(<Text className="custom-text-class">Custom class</Text>);
    expect(screen.getByText('Custom class')).toHaveClass('custom-text-class');
  });

  it('renders with custom element using as prop', () => {
    render(<Text as="span">Span element</Text>);
    const element = screen.getByText('Span element');
    expect(element.tagName).toBe('SPAN');
  });

  it('combines multiple classes correctly', () => {
    render(
      <Text
        variant="h2"
        color="primary"
        align="center"
        weight="bold"
        className="extra-class"
      >
        Combined styles
      </Text>
    );
    
    const element = screen.getByText('Combined styles');
    expect(element.className).toMatch(/text/);
    expect(element.className).toMatch(/h2/);
    expect(element.className).toMatch(/color-primary/);
    expect(element.className).toMatch(/align-center/);
    expect(element.className).toMatch(/weight-bold/);
    expect(element.className).toMatch(/extra-class/);
  });

  it('handles complex content', () => {
    render(
      <Text>
        Text with <strong>bold</strong> and <em>italic</em> content
      </Text>
    );
    
    expect(screen.getByText(/Text with/)).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  it('maintains semantic HTML structure', () => {
    render(
      <div>
        <Text variant="h1">Main Title</Text>
        <Text variant="h2">Subtitle</Text>
        <Text variant="body">Body content</Text>
        <Text variant="caption">Caption text</Text>
      </div>
    );

    // Check semantic structure
    const h1 = screen.getByRole('heading', { level: 1 });
    const h2 = screen.getByRole('heading', { level: 2 });
    
    expect(h1).toHaveTextContent('Main Title');
    expect(h2).toHaveTextContent('Subtitle');
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByText('Caption text')).toBeInTheDocument();
  });
});