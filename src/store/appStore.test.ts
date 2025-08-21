// Jest globals are available
import { useAppStore } from './appStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useAppStore.getState();
    store.reset();
  });

  it('should have initial state', () => {
    const state = useAppStore.getState();
    
    expect(state.resumeData).toBe(null);
    expect(state.jobDescription).toBe(null);
    expect(state.interviewQuestions).toEqual([]);
    expect(state.candidateQuestions).toEqual([]);
    expect(state.presentationTopics).toEqual([]);
    expect(state.atsScore).toBe(null);
    expect(state.interviewerRole).toBe('');
    expect(state.isLoading).toBe(false);
    expect(state.currentStep).toBe('upload');
    expect(state.theme).toBe('light');
  });

  it('should set resume data', () => {
    const store = useAppStore.getState();
    const resumeData = {
      name: 'Test User',
      email: 'test@example.com',
      experience: [],
      skills: [],
      education: []
    };
    
    store.setResumeData(resumeData);
    
    expect(useAppStore.getState().resumeData).toBe(resumeData);
  });

  it('should set job description', () => {
    const store = useAppStore.getState();
    const jobDescription = {
      title: 'Software Engineer',
      company: 'Test Company',
      requirements: [],
      responsibilities: [],
      preferredSkills: [],
      description: 'Test description'
    };
    
    store.setJobDescription(jobDescription);
    
    expect(useAppStore.getState().jobDescription).toBe(jobDescription);
  });

  it('should set interview questions', () => {
    const store = useAppStore.getState();
    const questions = [
      { id: '1', type: 'technical' as const, question: 'Question 1' },
      { id: '2', type: 'behavioral' as const, question: 'Question 2' }
    ];
    
    store.setInterviewQuestions(questions);
    
    expect(useAppStore.getState().interviewQuestions).toEqual(questions);
  });

  it('should set candidate questions', () => {
    const store = useAppStore.getState();
    const questions = [
      { id: '1', category: 'role' as const, question: 'Question 1', rationale: 'Test', timing: 'early' as const },
      { id: '2', category: 'company' as const, question: 'Question 2', rationale: 'Test', timing: 'middle' as const }
    ];
    
    store.setCandidateQuestions(questions);
    
    expect(useAppStore.getState().candidateQuestions).toEqual(questions);
  });

  it('should set presentation topics', () => {
    const store = useAppStore.getState();
    const topics = [
      { id: '1', title: 'Topic 1', bullets: [] },
      { id: '2', title: 'Topic 2', bullets: [] }
    ];
    
    store.setPresentationTopics(topics);
    
    expect(useAppStore.getState().presentationTopics).toEqual(topics);
  });

  it('should set ATS score', () => {
    const store = useAppStore.getState();
    const atsScore = {
      score: 85,
      strengths: [],
      improvements: [],
      keywordMatches: [],
      missingKeywords: []
    };
    
    store.setATSScore(atsScore);
    
    expect(useAppStore.getState().atsScore).toBe(atsScore);
  });

  it('should set interviewer role', () => {
    const store = useAppStore.getState();
    const role = 'Senior Engineer';
    
    store.setInterviewerRole(role);
    
    expect(useAppStore.getState().interviewerRole).toBe(role);
  });

  it('should set loading state', () => {
    const store = useAppStore.getState();
    
    store.setLoading(true);
    expect(useAppStore.getState().isLoading).toBe(true);
    
    store.setLoading(false);
    expect(useAppStore.getState().isLoading).toBe(false);
  });

  it('should set current step', () => {
    const store = useAppStore.getState();
    
    store.setCurrentStep('analysis');
    expect(useAppStore.getState().currentStep).toBe('analysis');
    
    store.setCurrentStep('interview');
    expect(useAppStore.getState().currentStep).toBe('interview');
  });

  it('should set theme', () => {
    const store = useAppStore.getState();
    
    store.setTheme('dark');
    expect(useAppStore.getState().theme).toBe('dark');
    
    store.setTheme('light');
    expect(useAppStore.getState().theme).toBe('light');
  });

  it('should toggle theme', () => {
    const store = useAppStore.getState();
    
    // Start with light theme
    expect(useAppStore.getState().theme).toBe('light');
    
    store.toggleTheme();
    expect(useAppStore.getState().theme).toBe('dark');
    
    store.toggleTheme();
    expect(useAppStore.getState().theme).toBe('light');
  });

  it('should reset store to initial state', () => {
    const store = useAppStore.getState();
    
    // Set some data
    store.setResumeData({ name: 'Test', email: 'test@test.com', experience: [], skills: [], education: [] });
    store.setJobDescription({ title: 'Test', company: 'Test Co', requirements: [], responsibilities: [], preferredSkills: [], description: 'Test' });
    store.setInterviewQuestions([{ id: '1', type: 'technical' as const, question: 'Test question' }]);
    store.setLoading(true);
    store.setCurrentStep('analysis');
    store.setTheme('dark');
    
    // Reset
    store.reset();
    
    // Check all values are back to initial state
    const state = useAppStore.getState();
    expect(state.resumeData).toBe(null);
    expect(state.jobDescription).toBe(null);
    expect(state.interviewQuestions).toEqual([]);
    expect(state.candidateQuestions).toEqual([]);
    expect(state.presentationTopics).toEqual([]);
    expect(state.atsScore).toBe(null);
    expect(state.interviewerRole).toBe('');
    expect(state.isLoading).toBe(false);
    expect(state.currentStep).toBe('upload');
    expect(state.theme).toBe('light');
  });
});