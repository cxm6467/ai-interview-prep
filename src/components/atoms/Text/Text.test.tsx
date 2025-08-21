import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Text } from './Text';

describe('Text Component', () => {
  it('renders with default props', () => {
    render(<Text>Default text</Text>);
    const text = screen.getByText('Default text');
    expect(text).toBeInTheDocument();
    expect(text.tagName.toLowerCase()).toBe('p');
  });

  it('renders different heading variants with correct HTML elements', () => {
    const { rerender } = render(<Text variant="h1">Heading 1</Text>);
    let element = screen.getByText('Heading 1');
    expect(element.tagName.toLowerCase()).toBe('h1');

    rerender(<Text variant="h2">Heading 2</Text>);
    element = screen.getByText('Heading 2');
    expect(element.tagName.toLowerCase()).toBe('h2');

    rerender(<Text variant="h3">Heading 3</Text>);
    element = screen.getByText('Heading 3');
    expect(element.tagName.toLowerCase()).toBe('h3');

    rerender(<Text variant="h4">Heading 4</Text>);
    element = screen.getByText('Heading 4');
    expect(element.tagName.toLowerCase()).toBe('h4');
  });

  it('renders body, small, and caption variants as paragraphs', () => {
    const { rerender } = render(<Text variant="body">Body text</Text>);
    let element = screen.getByText('Body text');
    expect(element.tagName.toLowerCase()).toBe('p');

    rerender(<Text variant="small">Small text</Text>);
    element = screen.getByText('Small text');
    expect(element.tagName.toLowerCase()).toBe('p');

    rerender(<Text variant="caption">Caption text</Text>);
    element = screen.getByText('Caption text');
    expect(element.tagName.toLowerCase()).toBe('p');
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Text variant="h1">Heading</Text>);
    let element = screen.getByText('Heading');
    expect(element).toHaveClass('h1');

    rerender(<Text variant="body">Body</Text>);
    element = screen.getByText('Body');
    expect(element).toHaveClass('body');

    rerender(<Text variant="small">Small</Text>);
    element = screen.getByText('Small');
    expect(element).toHaveClass('small');
  });

  it('applies color classes correctly', () => {
    const { rerender } = render(<Text color="primary">Primary color</Text>);
    let element = screen.getByText('Primary color');
    expect(element).toHaveClass('color-primary');

    rerender(<Text color="secondary">Secondary color</Text>);
    element = screen.getByText('Secondary color');
    expect(element).toHaveClass('color-secondary');

    rerender(<Text color="tertiary">Tertiary color</Text>);
    element = screen.getByText('Tertiary color');
    expect(element).toHaveClass('color-tertiary');

    rerender(<Text color="accent">Accent color</Text>);
    element = screen.getByText('Accent color');
    expect(element).toHaveClass('color-accent');
  });

  it('applies alignment classes correctly', () => {
    const { rerender } = render(<Text align="left">Left aligned</Text>);
    let element = screen.getByText('Left aligned');
    expect(element).toHaveClass('align-left');

    rerender(<Text align="center">Center aligned</Text>);
    element = screen.getByText('Center aligned');
    expect(element).toHaveClass('align-center');

    rerender(<Text align="right">Right aligned</Text>);
    element = screen.getByText('Right aligned');
    expect(element).toHaveClass('align-right');
  });

  it('applies weight classes correctly', () => {
    const { rerender } = render(<Text weight="normal">Normal weight</Text>);
    let element = screen.getByText('Normal weight');
    expect(element).toHaveClass('weight-normal');

    rerender(<Text weight="medium">Medium weight</Text>);
    element = screen.getByText('Medium weight');
    expect(element).toHaveClass('weight-medium');

    rerender(<Text weight="bold">Bold weight</Text>);
    element = screen.getByText('Bold weight');
    expect(element).toHaveClass('weight-bold');
  });

  it('applies custom className', () => {
    render(<Text className="custom-text-class">Custom class</Text>);
    const element = screen.getByText('Custom class');
    expect(element).toHaveClass('custom-text-class');
  });

  it('uses custom HTML element when "as" prop is provided', () => {
    render(<Text as="span">Span element</Text>);
    const element = screen.getByText('Span element');
    expect(element.tagName.toLowerCase()).toBe('span');
  });

  it('renders complex children correctly', () => {
    render(
      <Text>
        Text with <strong>bold</strong> and <em>italic</em> parts
      </Text>
    );
    
    expect(screen.getByText(/Text with/)).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  it('applies all props together correctly', () => {
    render(
      <Text
        variant="h2"
        color="accent"
        align="center"
        weight="bold"
        className="custom-heading"
        as="div"
      >
        Complex text
      </Text>
    );
    
    const element = screen.getByText('Complex text');
    expect(element.tagName.toLowerCase()).toBe('div');
    expect(element).toHaveClass('h2');
    expect(element).toHaveClass('color-accent');
    expect(element).toHaveClass('align-center');
    expect(element).toHaveClass('weight-bold');
    expect(element).toHaveClass('custom-heading');
  });

  it('renders multiple text elements with different props', () => {
    render(
      <div>
        <Text variant="h1">Main Title</Text>
        <Text variant="h2">Subtitle</Text>
        <Text variant="body">Body content</Text>
        <Text variant="caption">Caption text</Text>
      </div>
    );

    const h1 = screen.getByRole('heading', { level: 1 });
    const h2 = screen.getByRole('heading', { level: 2 });
    
    expect(h1).toHaveTextContent('Main Title');
    expect(h2).toHaveTextContent('Subtitle');
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByText('Caption text')).toBeInTheDocument();
  });
});