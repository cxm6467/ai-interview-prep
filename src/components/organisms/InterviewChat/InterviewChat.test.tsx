import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';
import { InterviewChat } from './InterviewChat';
import { mockAppStore } from '../../../test/utils';

// Mock the store hook
vi.mock('@store/appStore', () => ({
  useAppStore: vi.fn()
}));

// Mock the AI service
vi.mock('@services/aiAnalysis', () => ({
  AIAnalysisService: {
    generateInterviewResponse: vi.fn()
  }
}));

// Mock the scroll hook
vi.mock('../../../hooks/useScrollFix', () => ({
  useAutoScrollToBottom: vi.fn(() => ({
    containerRef: { current: null },
    unseenCount: 0,
    isNearBottom: true,
    scrollToBottom: vi.fn()
  }))
}));

const mockUseAppStore = vi.mocked(await import('@store/appStore')).useAppStore;
const mockAIAnalysisService = vi.mocked(await import('@services/aiAnalysis')).AIAnalysisService;

describe('InterviewChat', () => {
  const mockInterviewQuestions = [
    {
      id: '1',
      question: 'Tell me about yourself',
      difficulty: 'easy' as const,
      category: 'behavioral' as const,
      followUp: 'What are your strengths?',
      suggestedAnswers: ['I am a software developer with 5 years of experience'],
      rationale: 'This helps assess self-awareness'
    },
    {
      id: '2', 
      question: 'What are your career goals?',
      difficulty: 'medium' as const,
      category: 'behavioral' as const,
      followUp: 'How does this role align with your goals?',
      suggestedAnswers: ['I want to grow as a technical leader'],
      rationale: 'This assesses long-term thinking'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAppStore.mockReturnValue({
      ...mockAppStore,
      interviewQuestions: mockInterviewQuestions,
      resumeData: 'John Doe, Software Engineer',
      interviewerRole: 'Senior Software Engineer',
      jobDescription: 'Full Stack Developer role',
      atsScore: 85,
      presentationTopics: ['System Design'],
      candidateQuestions: ['What is the team size?']
    });
  });

  it('renders without crashing', () => {
    render(<InterviewChat />);
    expect(screen.getByText('🤖 AI Interview Coach')).toBeInTheDocument();
  });

  it('initializes with welcome message when questions are available', async () => {
    render(<InterviewChat />);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome to your interview practice session/i)).toBeInTheDocument();
    });
  });

  it('displays the current question', async () => {
    render(<InterviewChat />);
    
    await waitFor(() => {
      expect(screen.getByText('Tell me about yourself')).toBeInTheDocument();
    });
  });

  it('handles empty questions state', () => {
    mockUseAppStore.mockReturnValue({
      ...mockAppStore,
      interviewQuestions: [],
      resumeData: null,
      interviewerRole: '',
      jobDescription: null,
      atsScore: null,
      presentationTopics: [],
      candidateQuestions: []
    });

    render(<InterviewChat />);
    
    // Should still render the component without crashing
    expect(screen.getByText('🤖 AI Interview Coach')).toBeInTheDocument();
  });

  it('allows user to type in input field', async () => {
    render(<InterviewChat />);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type your answer here/i);
      expect(input).toBeInTheDocument();
      
      fireEvent.change(input, { target: { value: 'My answer' } });
      expect(input).toHaveValue('My answer');
    });
  });

  it('handles send button click', async () => {
    render(<InterviewChat />);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type your answer here/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      fireEvent.change(input, { target: { value: 'My answer' } });
      fireEvent.click(sendButton);
      
      // Input should be cleared after sending
      expect(input).toHaveValue('');
    });
  });

  it('handles keyboard submission', async () => {
    render(<InterviewChat />);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type your answer here/i);
      
      fireEvent.change(input, { target: { value: 'My keyboard answer' } });
      fireEvent.keyDown(input, { key: 'Enter', ctrlKey: false });
      
      // Input should be cleared after sending
      expect(input).toHaveValue('');
    });
  });

  it('prevents submission of empty messages', async () => {
    render(<InterviewChat />);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type your answer here/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      // Try to send empty message
      fireEvent.click(sendButton);
      
      // Should not process empty submission
      expect(mockAIAnalysisService.generateInterviewResponse).not.toHaveBeenCalled();
    });
  });

  it('shows loading state during AI response', async () => {
    mockAIAnalysisService.generateInterviewResponse.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('AI response'), 100))
    );

    render(<InterviewChat />);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type your answer here/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);
      
      // Should show loading state
      expect(sendButton).toBeDisabled();
    });
  });

  it('displays suggested answers when available', async () => {
    render(<InterviewChat />);
    
    await waitFor(() => {
      expect(screen.getByText('Suggested approach:')).toBeInTheDocument();
      expect(screen.getByText('I am a software developer with 5 years of experience')).toBeInTheDocument();
    });
  });

  it('shows current question in welcome message', async () => {
    render(<InterviewChat />);
    
    await waitFor(() => {
      // Should show first question in the welcome message
      expect(screen.getByText('Tell me about yourself')).toBeInTheDocument();
    });
  });

  it('integrates with scroll functionality', async () => {
    const mockScrollToBottom = vi.fn();
    const mockUseAutoScrollToBottom = vi.mocked(await import('../../../hooks/useScrollFix')).useAutoScrollToBottom;
    
    mockUseAutoScrollToBottom.mockReturnValue({
      containerRef: { current: null },
      unseenCount: 3,
      isNearBottom: false,
      scrollToBottom: mockScrollToBottom
    });

    render(<InterviewChat />);
    
    // Should show scroll indicator when there are unseen messages
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders accessibility features correctly', async () => {
    render(<InterviewChat />);
    
    await waitFor(() => {
      // Main container should have proper role
      expect(screen.getByText('🤖 AI Interview Coach')).toBeInTheDocument();
      
      // Input should be properly labeled - it's a textarea, not input with type
      const input = screen.getByPlaceholderText(/Type your answer here/i);
      expect(input.tagName.toLowerCase()).toBe('textarea');
      
      // Buttons should be accessible
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset chat/i })).toBeInTheDocument();
    });
  });
});