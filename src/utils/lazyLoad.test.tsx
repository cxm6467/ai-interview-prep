import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { lazyLoad } from './lazyLoad';

// Mock component for testing
const MockComponent: React.ComponentType<{ name: string }> = ({ name }: { name: string }) => (
  <div data-testid="mock-component">Hello {name}</div>
);

describe('lazyLoad', () => {
  it('should lazy load a component', async () => {
    const LazyMockComponent = lazyLoad(() => 
      Promise.resolve({ default: MockComponent })
    );

    render(<LazyMockComponent name="World" />);

    // Should show loading fallback initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for component to load
    await screen.findByTestId('mock-component');
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should pass props to the lazy loaded component', async () => {
    const LazyMockComponent = lazyLoad(() => 
      Promise.resolve({ default: MockComponent })
    );

    render(<LazyMockComponent name="Test" />);

    await screen.findByTestId('mock-component');
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  it('should handle component loading with suspense fallback', () => {
    const LazyMockComponent = lazyLoad(() => 
      new Promise<{ default: React.ComponentType<any> }>(resolve => {
        setTimeout(() => resolve({ default: MockComponent as React.ComponentType<any> }), 100);
      })
    );

    render(<LazyMockComponent name="Delayed" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});