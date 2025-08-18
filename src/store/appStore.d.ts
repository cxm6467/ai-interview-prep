import type { ResumeData, JobDescription, InterviewQuestion, PresentationTopic, ATSScore } from '../types';
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
export declare const useAppStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AppState>>;
export {};
