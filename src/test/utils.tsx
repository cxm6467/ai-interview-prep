import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
// Jest globals are available

// Mock theme store
export const mockThemeStore = {
  theme: 'light',
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
};

// Mock app store
export const mockAppStore = {
  resumeData: null,
  jobDescription: null,
  interviewQuestions: [],
  candidateQuestions: [],
  presentationTopics: [],
  atsScore: null,
  interviewerRole: '',
  isLoading: false,
  currentStep: 'upload' as const,
  theme: 'light' as const,
  setResumeData: jest.fn(),
  setJobDescription: jest.fn(),
  setInterviewQuestions: jest.fn(),
  setCandidateQuestions: jest.fn(),
  setPresentationTopics: jest.fn(),
  setATSScore: jest.fn(),
  setInterviewerRole: jest.fn(),
  setLoading: jest.fn(),
  setCurrentStep: jest.fn(),
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
  reset: jest.fn(),
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    ...options,
  });
};

// Mock file for testing file uploads
export const createMockFile = (
  name: string = 'test.pdf',
  size: number = 1024,
  type: string = 'application/pdf'
): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Mock drag event
export const createMockDragEvent = (files: File[]) => {
  return {
    dataTransfer: {
      files,
      items: files.map(file => ({ kind: 'file', type: file.type, getAsFile: () => file })),
      types: ['Files']
    },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  };
};

// Mock text-to-speech responses
export const mockTTSResponse = {
  isSupported: true,
  isSpeaking: false,
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  voices: []
};

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { customRender as render };
// Jest utilities exported above