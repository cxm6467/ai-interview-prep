/**
 * @fileoverview Unit tests for Text component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Text } from './Text';

describe('Text Component', () => {
  describe('Rendering', () => {
    it('renders text content correctly', () => {
      render(<Text>Hello World</Text>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders with different HTML elements based on "as" prop', () => {
      const { rerender, container } = render(<Text as="h1">Heading 1</Text>);
      expect(container.querySelector('h1')).toBeInTheDocument();
      expect(container.querySelector('h1')).toHaveTextContent('Heading 1');

      rerender(<Text as="span">Span Text</Text>);
      expect(container.querySelector('span')).toBeInTheDocument();

      rerender(<Text as="p">Paragraph</Text>);
      expect(container.querySelector('p')).toBeInTheDocument();

      rerender(<Text as="div">Division</Text>);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
      const { rerender } = render(<Text variant="h1">Large Heading</Text>);
      let textElement = screen.getByText('Large Heading');
      expect(textElement).toHaveClass('h1');

      rerender(<Text variant="h2">Medium Heading</Text>);
      textElement = screen.getByText('Medium Heading');
      expect(textElement).toHaveClass('h2');

      rerender(<Text variant="h3">Small Heading</Text>);
      textElement = screen.getByText('Small Heading');
      expect(textElement).toHaveClass('h3');

      rerender(<Text variant="body">Body Text</Text>);
      textElement = screen.getByText('Body Text');
      expect(textElement).toHaveClass('body');

      rerender(<Text variant="small">Small Text</Text>);
      textElement = screen.getByText('Small Text');
      expect(textElement).toHaveClass('small');

      rerender(<Text variant="caption">Caption Text</Text>);
      textElement = screen.getByText('Caption Text');
      expect(textElement).toHaveClass('caption');
    });

    it('applies color classes correctly', () => {
      const { rerender } = render(<Text color="primary">Primary Color</Text>);
      let textElement = screen.getByText('Primary Color');
      expect(textElement).toHaveClass('primary');

      rerender(<Text color="secondary">Secondary Color</Text>);
      textElement = screen.getByText('Secondary Color');
      expect(textElement).toHaveClass('secondary');

      rerender(<Text color="tertiary">Tertiary Color</Text>);
      textElement = screen.getByText('Tertiary Color');
      expect(textElement).toHaveClass('tertiary');

      rerender(<Text color="accent">Accent Color</Text>);
      textElement = screen.getByText('Accent Color');
      expect(textElement).toHaveClass('accent');
    });

    it('applies alignment classes correctly', () => {
      const { rerender } = render(<Text align="left">Left Aligned</Text>);
      let textElement = screen.getByText('Left Aligned');
      expect(textElement).toHaveClass('alignLeft');

      rerender(<Text align="center">Center Aligned</Text>);
      textElement = screen.getByText('Center Aligned');
      expect(textElement).toHaveClass('alignCenter');

      rerender(<Text align="right">Right Aligned</Text>);
      textElement = screen.getByText('Right Aligned');
      expect(textElement).toHaveClass('alignRight');
    });

    it('applies weight classes correctly', () => {
      const { rerender } = render(<Text weight="normal">Normal Weight</Text>);
      let textElement = screen.getByText('Normal Weight');
      expect(textElement).toHaveClass('weightNormal');

      rerender(<Text weight="medium">Medium Weight</Text>);
      textElement = screen.getByText('Medium Weight');
      expect(textElement).toHaveClass('weightMedium');

      rerender(<Text weight="bold">Bold Weight</Text>);
      textElement = screen.getByText('Bold Weight');
      expect(textElement).toHaveClass('weightBold');
    });

    it('applies custom className', () => {
      render(<Text className="custom-text-class">Custom Class</Text>);
      const textElement = screen.getByText('Custom Class');
      expect(textElement).toHaveClass('custom-text-class');
    });

    it('combines multiple classes correctly', () => {
      render(
        <Text 
          variant="h2" 
          color="accent" 
          align="center" 
          weight="bold"
          className="custom"
        >
          Multiple Classes
        </Text>
      );
      
      const textElement = screen.getByText('Multiple Classes');
      expect(textElement).toHaveClass('h2');
      expect(textElement).toHaveClass('accent');
      expect(textElement).toHaveClass('alignCenter');
      expect(textElement).toHaveClass('weightBold');
      expect(textElement).toHaveClass('custom');
    });
  });

  describe('Semantic HTML', () => {
    it('renders as div by default', () => {
      const { container } = render(<Text>Default Element</Text>);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('supports all valid HTML elements', () => {
      const elements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'article', 'section'];
      
      elements.forEach(element => {
        const { container } = render(
          <Text as={element as any} key={element}>
            {element} text
          </Text>
        );
        expect(container.querySelector(element)).toBeInTheDocument();
      });
    });

    it('maintains semantic meaning with heading variants', () => {
      const { container } = render(<Text as="h1" variant="h1">Semantic Heading</Text>);
      const heading = container.querySelector('h1');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('h1');
    });
  });

  describe('Content Handling', () => {
    it('handles string content', () => {
      render(<Text>String content</Text>);
      expect(screen.getByText('String content')).toBeInTheDocument();
    });

    it('handles numeric content', () => {
      render(<Text>{42}</Text>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles React node content', () => {
      render(
        <Text>
          <span>Nested</span> <strong>content</strong>
        </Text>
      );
      
      expect(screen.getByText('Nested')).toBeInTheDocument();
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('handles empty content gracefully', () => {
      render(<Text>{''}</Text>);
      expect(screen.getByText('')).toBeInTheDocument();
    });

    it('handles boolean and null content gracefully', () => {
      const { rerender } = render(<Text>{null}</Text>);
      expect(screen.getByRole('generic')).toBeInTheDocument(); // div role

      rerender(<Text>{undefined}</Text>);
      expect(screen.getByRole('generic')).toBeInTheDocument();

      rerender(<Text>{false}</Text>);
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('uses default props when none specified', () => {
      const { container } = render(<Text>Default Props</Text>);
      const textElement = container.firstChild as HTMLElement;
      
      expect(textElement.tagName.toLowerCase()).toBe('div'); // default element
      expect(textElement).toHaveClass('body'); // default variant
      expect(textElement).toHaveClass('primary'); // default color
      // No alignment class should be applied by default
      expect(textElement.className).not.toMatch(/align/);
      // No weight class should be applied by default  
      expect(textElement.className).not.toMatch(/weight/);
    });
  });

  describe('Accessibility', () => {
    it('maintains proper heading hierarchy', () => {
      const { container } = render(
        <div>
          <Text as="h1" variant="h1">Main Title</Text>
          <Text as="h2" variant="h2">Subtitle</Text>
          <Text as="h3" variant="h3">Section Title</Text>
        </div>
      );
      
      expect(container.querySelector('h1')).toBeInTheDocument();
      expect(container.querySelector('h2')).toBeInTheDocument();
      expect(container.querySelector('h3')).toBeInTheDocument();
    });

    it('works with screen readers', () => {
      render(<Text as="p">Screen reader accessible text</Text>);
      expect(screen.getByText('Screen reader accessible text')).toBeInTheDocument();
    });

    it('supports ARIA attributes when used with semantic elements', () => {
      const { container } = render(
        <Text as="h1" aria-level={1}>
          ARIA Heading
        </Text>
      );
      
      const heading = container.querySelector('h1');
      expect(heading).toHaveAttribute('aria-level', '1');
    });
  });

  describe('CSS Classes', () => {
    it('applies base text class', () => {
      render(<Text>Base Class Test</Text>);
      const textElement = screen.getByText('Base Class Test');
      expect(textElement).toHaveClass('text'); // Assuming base class name
    });

    it('handles className prop correctly with other props', () => {
      render(
        <Text 
          variant="h2" 
          color="secondary" 
          className="my-custom-class another-class"
        >
          Multiple Classes
        </Text>
      );
      
      const textElement = screen.getByText('Multiple Classes');
      expect(textElement).toHaveClass('my-custom-class');
      expect(textElement).toHaveClass('another-class');
      expect(textElement).toHaveClass('h2');
      expect(textElement).toHaveClass('secondary');
    });
  });
});