# Testing Guide

This project uses Jest with React Testing Library for testing TypeScript and TypeScript React components. All Vitest references have been removed and replaced with Jest.

## Setup

The testing framework is configured with:
- **Jest**: JavaScript testing framework
- **ts-jest**: TypeScript support for Jest
- **React Testing Library**: React component testing utilities
- **jest-dom**: Custom Jest matchers for DOM testing
- **identity-obj-proxy**: CSS modules mocking
- **jsdom**: DOM environment for testing

## Configuration

### Jest Configuration (`jest.config.js`)
- Uses `ts-jest` preset for TypeScript support
- Configured for `jsdom` environment for React testing
- Path aliases configured for imports
- CSS modules mocked with `identity-obj-proxy`
- Coverage reporting enabled

### Test Setup (`src/test/setup.ts`)
- Imports `@testing-library/jest-dom` matchers
- Mocks browser APIs:
  - SpeechSynthesis
  - localStorage
  - fetch
  - IntersectionObserver
  - ResizeObserver

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

## Writing Tests

### Test File Structure
- Place test files alongside the component/module being tested
- Use `.test.ts` for TypeScript modules
- Use `.test.tsx` for React components

### Example Component Test
```typescript
// Jest globals are available
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const mockFn = jest.fn();
    
    render(<MyComponent onClick={mockFn} />);
    
    await user.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
```

### Example Service Test
```typescript
// Jest globals are available
import { MyService } from './MyService';

// Mock dependencies
jest.mock('external-library', () => ({
  someFunction: jest.fn(),
}));

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('processes data correctly', () => {
    const result = MyService.processData('input');
    expect(result).toBe('processed');
  });
});
```

## Coverage

The project aims for 80% test coverage across:
- Statements
- Branches  
- Functions
- Lines

Coverage reports are generated in the `coverage/` directory and include:
- Text output in terminal
- HTML report for browser viewing
- LCOV format for CI integration

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component/module does, not how it does it
2. **Use Descriptive Test Names**: Tests should clearly describe what they're testing
3. **Arrange-Act-Assert**: Structure tests with clear setup, action, and assertion phases
4. **Mock External Dependencies**: Keep tests isolated and fast
5. **Test Error Cases**: Include tests for error conditions and edge cases
6. **Keep Tests Simple**: Each test should verify one specific behavior

## CSS Modules Testing

Since this project uses CSS Modules, class names are scoped. In tests, use regex matching:

```typescript
expect(element.className).toMatch(/button/);
expect(element.className).toMatch(/primary/);
```

## Common Test Patterns

### Testing Async Operations
```typescript
it('handles async operations', async () => {
  render(<AsyncComponent />);
  await screen.findByText('Loaded');
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Testing Forms
```typescript
it('submits form data', async () => {
  const user = userEvent.setup();
  const mockSubmit = jest.fn();
  
  render(<Form onSubmit={mockSubmit} />);
  
  await user.type(screen.getByLabelText('Name'), 'John');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(mockSubmit).toHaveBeenCalledWith({ name: 'John' });
});
```

### Testing Timers
```typescript
it('handles timers', () => {
  jest.useFakeTimers();
  
  render(<TimerComponent />);
  
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  
  expect(screen.getByText('1 second')).toBeInTheDocument();
  
  jest.useRealTimers();
});
```