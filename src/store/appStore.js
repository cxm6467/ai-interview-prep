import { create } from 'zustand';
export const useAppStore = create((set) => ({
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
