import { create } from 'zustand';
import type { ResumeData, JobDescription, InterviewQuestion, PresentationTopic, ATSScore } from '@types';

interface AppState {
  resumeData: ResumeData | null;
  jobDescription: JobDescription | null;
  interviewQuestions: InterviewQuestion[];
  presentationTopics: PresentationTopic[];
  atsScore: ATSScore | null;
  
  isLoading: boolean;
  currentStep: 'upload' | 'analysis' | 'dashboard';
  theme: 'light' | 'dark';
  
  setResumeData: (data: ResumeData) => void;
  setJobDescription: (data: JobDescription) => void;
  setInterviewQuestions: (questions: InterviewQuestion[]) => void;
  setPresentationTopics: (topics: PresentationTopic[]) => void;
  setATSScore: (score: ATSScore) => void;
  setLoading: (loading: boolean) => void;
  setCurrentStep: (step: 'upload' | 'analysis' | 'dashboard') => void;
  toggleTheme: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  resumeData: null,
  jobDescription: null,
  interviewQuestions: [],
  presentationTopics: [],
  atsScore: null,
  isLoading: false,
  currentStep: 'upload',
  theme: 'dark',
  
  setResumeData: (data) => set({ resumeData: data }),
  setJobDescription: (data) => set({ jobDescription: data }),
  setInterviewQuestions: (questions) => set({ interviewQuestions: questions }),
  setPresentationTopics: (topics) => set({ presentationTopics: topics }),
  setATSScore: (score) => set({ atsScore: score }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentStep: (step) => set({ currentStep: step }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'dark' ? 'light' : 'dark' 
  })),
  reset: () => set({
    resumeData: null,
    jobDescription: null,
    interviewQuestions: [],
    presentationTopics: [],
    atsScore: null,
    currentStep: 'upload'
  })
}));
