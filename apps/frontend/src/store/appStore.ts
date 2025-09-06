import { create } from 'zustand';
import type { ResumeData, JobDescription, InterviewQuestion, CandidateQuestion, PresentationTopic, ATSScore, ExtendedThemeType } from '@cxm6467/ai-interview-prep-types';

interface AppState {
  resumeData: ResumeData | null;
  jobDescription: JobDescription | null;
  interviewQuestions: InterviewQuestion[];
  candidateQuestions: CandidateQuestion[];
  presentationTopics: PresentationTopic[];
  atsScore: ATSScore | null;
  interviewerRole: string;
  currentDadJoke: string | null;
  
  isLoading: boolean;
  currentStep: 'upload' | 'analysis' | 'dashboard' | 'interview';
  theme: ExtendedThemeType;
  
  setResumeData: (data: ResumeData) => void;
  setJobDescription: (data: JobDescription) => void;
  setInterviewQuestions: (questions: InterviewQuestion[]) => void;
  setCandidateQuestions: (questions: CandidateQuestion[]) => void;
  setPresentationTopics: (topics: PresentationTopic[]) => void;
  setATSScore: (score: ATSScore) => void;
  setInterviewerRole: (role: string) => void;
  setCurrentDadJoke: (joke: string | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentStep: (step: 'upload' | 'analysis' | 'dashboard' | 'interview') => void;
  setTheme: (theme: ExtendedThemeType) => void;
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
  currentDadJoke: null,
  isLoading: false,
  currentStep: 'upload',
  theme: 'dark',
  
  setResumeData: (data) => set({ resumeData: data }),
  setJobDescription: (data) => set({ jobDescription: data }),
  setInterviewQuestions: (questions) => set({ interviewQuestions: questions }),
  setCandidateQuestions: (questions) => set({ candidateQuestions: questions }),
  setPresentationTopics: (topics) => set({ presentationTopics: topics }),
  setATSScore: (score) => set({ atsScore: score }),
  setInterviewerRole: (role) => set({ interviewerRole: role }),
  setCurrentDadJoke: (joke) => set({ currentDadJoke: joke }),
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
    currentDadJoke: null,
    isLoading: false,
    currentStep: 'upload',
    theme: 'dark'
  })
}));
