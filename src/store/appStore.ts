import { create } from 'zustand';
import type { ResumeData, JobDescription, InterviewQuestion, PresentationTopic, ATSScore } from '../types';

interface AppState {
  resumeData: ResumeData | null;
  jobDescription: JobDescription | null;
  interviewQuestions: InterviewQuestion[];
  presentationTopics: PresentationTopic[];
  atsScore: ATSScore | null;
  interviewerRole: string;
  
  isLoading: boolean;
  currentStep: 'upload' | 'analysis' | 'dashboard' | 'interview';
  theme: 'light' | 'dark';
  
  setResumeData: (data: ResumeData) => void;
  setJobDescription: (data: JobDescription) => void;
  setInterviewQuestions: (questions: InterviewQuestion[]) => void;
  setPresentationTopics: (topics: PresentationTopic[]) => void;
  setATSScore: (score: ATSScore) => void;
  setInterviewerRole: (role: string) => void;
  setLoading: (loading: boolean) => void;
  setCurrentStep: (step: 'upload' | 'analysis' | 'dashboard' | 'interview') => void;
  toggleTheme: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  resumeData: null,
  jobDescription: null,
  interviewQuestions: [],
  presentationTopics: [],
  atsScore: null,
  interviewerRole: '',
  isLoading: false,
  currentStep: 'upload',
  theme: 'dark',
  
  setResumeData: (data) => set({ resumeData: data }),
  setJobDescription: (data) => set({ jobDescription: data }),
  setInterviewQuestions: (questions) => set({ interviewQuestions: questions }),
  setPresentationTopics: (topics) => set({ presentationTopics: topics }),
  setATSScore: (score) => set({ atsScore: score }),
  setInterviewerRole: (role) => set({ interviewerRole: role }),
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
    interviewerRole: '',
    currentStep: 'upload'
  })
}));
