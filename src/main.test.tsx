import { createRoot } from 'react-dom/client';

// Mock createRoot
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
  })),
}));

// Mock App component
jest.mock('./App', () => {
  return function MockApp() {
    return <div data-testid="app">App</div>;
  };
});

// Mock CSS import
jest.mock('./index.css', () => ({}));

describe('main.tsx', () => {
  beforeEach(() => {
    // Mock document.getElementById
    const mockElement = document.createElement('div');
    mockElement.id = 'root';
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create root and render app', () => {
    const mockRender = jest.fn();
    const mockCreateRoot = createRoot as jest.MockedFunction<typeof createRoot>;
    mockCreateRoot.mockReturnValue({
      render: mockRender,
      unmount: jest.fn(),
    });

    // Import main.tsx to trigger the execution
    jest.requireActual('./main');

    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(createRoot).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalled();
  });
});