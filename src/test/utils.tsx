import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { vi } from 'vitest';

// Mock theme store
export const mockThemeStore = {
  theme: 'light',
  setTheme: vi.fn(),
  toggleTheme: vi.fn(),
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
  setResumeData: vi.fn(),
  setJobDescription: vi.fn(),
  setInterviewQuestions: vi.fn(),
  setCandidateQuestions: vi.fn(),
  setPresentationTopics: vi.fn(),
  setATSScore: vi.fn(),
  setInterviewerRole: vi.fn(),
  setLoading: vi.fn(),
  setCurrentStep: vi.fn(),
  setTheme: vi.fn(),
  toggleTheme: vi.fn(),
  reset: vi.fn(),
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
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  };
};

// Mock text-to-speech responses
export const mockTTSResponse = {
  isSupported: true,
  isSpeaking: false,
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  voices: []
};

export * from '@testing-library/react';
export { customRender as render };
export { vi };