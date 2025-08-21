import { create } from 'zustand';
import type { ResumeData, JobDescription, InterviewQuestion, CandidateQuestion, PresentationTopic, ATSScore, ThemeType } from '../types';

interface AppState {
  resumeData: ResumeData | null;
  jobDescription: JobDescription | null;
  interviewQuestions: InterviewQuestion[];
  candidateQuestions: CandidateQuestion[];
  presentationTopics: PresentationTopic[];
  atsScore: ATSScore | null;
  interviewerRole: string;
  
  isLoading: boolean;
  currentStep: 'upload' | 'analysis' | 'dashboard' | 'interview';
  theme: ThemeType;
  
  setResumeData: (data: ResumeData) => void;
  setJobDescription: (data: JobDescription) => void;
  setInterviewQuestions: (questions: InterviewQuestion[]) => void;
  setCandidateQuestions: (questions: CandidateQuestion[]) => void;
  setPresentationTopics: (topics: PresentationTopic[]) => void;
  setATSScore: (score: ATSScore) => void;
  setInterviewerRole: (role: string) => void;
  setLoading: (loading: boolean) => void;
  setCurrentStep: (step: 'upload' | 'analysis' | 'dashboard' | 'interview') => void;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  resumeData: null,
  jobDescription: null,
  interviewQuestions: [],
  candidateQuestions: [],
  presentationTopics: [],
  atsScore: null,
  interviewerRole: '',
  isLoading: false,
  currentStep: 'upload',
  theme: 'light',
  
  setResumeData: (data) => set({ resumeData: data }),
  setJobDescription: (data) => set({ jobDescription: data }),
  setInterviewQuestions: (questions) => set({ interviewQuestions: questions }),
  setCandidateQuestions: (questions) => set({ candidateQuestions: questions }),
  setPresentationTopics: (topics) => set({ presentationTopics: topics }),
  setATSScore: (score) => set({ atsScore: score }),
  setInterviewerRole: (role) => set({ interviewerRole: role }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'dark' ? 'light' : 'dark' 
  })),
  reset: () => set({
    resumeData: null,
    jobDescription: null,
    interviewQuestions: [],
    candidateQuestions: [],
    presentationTopics: [],
    atsScore: null,
    interviewerRole: '',
    isLoading: false,
    currentStep: 'upload',
    theme: 'light'
  })
}));
