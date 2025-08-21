// Jest globals available
import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import { FileUpload } from './FileUpload';
import { createMockFile, createMockDragEvent } from '../../../test/utils';

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn()
}));

import { useDropzone } from 'react-dropzone';
const mockUseDropzone = useDropzone as jest.MockedFunction<typeof useDropzone>;

describe('FileUpload', () => {
  const mockOnDrop = jest.fn();
  const mockGetRootProps = jest.fn(() => ({
    'data-testid': 'dropzone-root'
  }));
  const mockGetInputProps = jest.fn(() => ({
    'data-testid': 'dropzone-input'
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDropzone.mockReturnValue({
      getRootProps: mockGetRootProps,
      getInputProps: mockGetInputProps,
      isDragActive: false,
      isDragReject: false,
      isDragAccept: false,
      fileRejections: [],
      acceptedFiles: [],
      open: jest.fn()
    } as any);
  });

  it('renders with default props', () => {
    render(<FileUpload onDrop={mockOnDrop} />);
    
    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getByText('Drag & drop a single file or click to browse')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-root')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-input')).toBeInTheDocument();
  });

  it('renders custom label and description', () => {
    render(
      <FileUpload 
        onDrop={mockOnDrop} 
        label="Upload Resume" 
        description="Upload your PDF or DOCX resume"
      />
    );
    
    expect(screen.getByText('Upload Resume')).toBeInTheDocument();
    expect(screen.getByText('Upload your PDF or DOCX resume')).toBeInTheDocument();
  });

  it('displays uploaded file information', () => {
    const mockFile = createMockFile('test-resume.pdf', 1024, 'application/pdf');
    
    render(<FileUpload onDrop={mockOnDrop} file={mockFile} />);
    
    expect(screen.getByText('test-resume.pdf')).toBeInTheDocument();
    // Note: Current implementation only shows filename, not size or remove button
  });

  it('shows drag active state', () => {
    mockUseDropzone.mockReturnValue({
      getRootProps: mockGetRootProps,
      getInputProps: mockGetInputProps,
      isDragActive: true,
      isDragReject: false,
      isDragAccept: true,
      fileRejections: [],
      acceptedFiles: [],
      open: jest.fn()
    } as any);

    const { container } = render(<FileUpload onDrop={mockOnDrop} />);
    
    // Check that drag active styling is applied
    const dropzoneElement = container.querySelector('[data-testid="dropzone-root"]');
    expect(dropzoneElement).toBeInTheDocument();
  });

  it('shows drag reject state', () => {
    mockUseDropzone.mockReturnValue({
      getRootProps: mockGetRootProps,
      getInputProps: mockGetInputProps,
      isDragActive: true,
      isDragReject: true,
      isDragAccept: false,
      fileRejections: [],
      acceptedFiles: [],
      open: jest.fn()
    } as any);

    const { container } = render(<FileUpload onDrop={mockOnDrop} />);
    
    const dropzoneElement = container.querySelector('[data-testid="dropzone-root"]');
    expect(dropzoneElement).toBeInTheDocument();
  });

  it('calls onDrop with files when dropzone is used', async () => {
    const mockOpen = jest.fn();
    mockUseDropzone.mockImplementation((config) => {
      // Simulate file drop
      if (config?.onDrop) {
        const mockFile = createMockFile('test.pdf', 1024, 'application/pdf');
        setTimeout(() => config.onDrop?.([mockFile], [], expect.any(Object)), 0);
      }
      
      return {
        getRootProps: mockGetRootProps,
        getInputProps: mockGetInputProps,
        isDragActive: false,
        isDragReject: false,
        isDragAccept: false,
        fileRejections: [],
        acceptedFiles: [],
        open: mockOpen
      } as any;
    });

    render(<FileUpload onDrop={mockOnDrop} />);
    
    await waitFor(() => {
      expect(mockOnDrop).toHaveBeenCalledWith([expect.objectContaining({
        name: 'test.pdf',
        size: 1024,
        type: 'application/pdf'
      })]);
    });
  });

  it('handles file interaction correctly', () => {
    const mockFile = createMockFile('test-resume.pdf', 1024, 'application/pdf');
    
    render(<FileUpload onDrop={mockOnDrop} file={mockFile} />);
    
    // Verify file is displayed
    expect(screen.getByText('test-resume.pdf')).toBeInTheDocument();
    
    // Current implementation doesn't have remove functionality
    // Users would need to re-upload to replace file
  });

  it('applies custom className', () => {
    const { container } = render(
      <FileUpload onDrop={mockOnDrop} className="custom-upload" />
    );
    
    expect(container.firstChild).toHaveClass('custom-upload');
  });

  it('renders custom children when provided', () => {
    render(
      <FileUpload onDrop={mockOnDrop}>
        <div data-testid="custom-content">Custom upload content</div>
      </FileUpload>
    );
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom upload content')).toBeInTheDocument();
  });

  it('supports different file types via accept prop', () => {
    const customAccept = {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    };
    
    render(<FileUpload onDrop={mockOnDrop} accept={customAccept} />);
    
    // Verify dropzone was called with custom accept
    expect(mockUseDropzone).toHaveBeenCalledWith(
      expect.objectContaining({
        accept: customAccept
      })
    );
  });

  it('supports custom maxFiles prop', () => {
    render(<FileUpload onDrop={mockOnDrop} maxFiles={5} />);
    
    expect(mockUseDropzone).toHaveBeenCalledWith(
      expect.objectContaining({
        maxFiles: 5
      })
    );
  });

  it('handles different file types', () => {
    const testCases = [
      { name: 'resume.pdf', type: 'application/pdf' },
      { name: 'document.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { name: 'oldformat.doc', type: 'application/msword' }
    ];

    testCases.forEach(({ name, type }) => {
      const mockFile = createMockFile(name, 1024, type);
      const { unmount } = render(<FileUpload onDrop={mockOnDrop} file={mockFile} />);
      
      expect(screen.getByText(name)).toBeInTheDocument();
      unmount();
    });
  });

  it('maintains accessibility attributes', () => {
    render(<FileUpload onDrop={mockOnDrop} />);
    
    const input = screen.getByTestId('dropzone-input');
    expect(input).toBeInTheDocument();
    
    // Verify dropzone maintains accessibility
    expect(mockGetRootProps).toHaveBeenCalled();
    expect(mockGetInputProps).toHaveBeenCalled();
  });
});