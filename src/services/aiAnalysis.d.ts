import type { ResumeData, JobDescription, InterviewQuestion, PresentationTopic, ATSScore } from '../types';
export declare class AIAnalysisService {
    private static getOpenAIKey;
    private static callOpenAI;
    static analyzeResume(resumeText: string): Promise<ResumeData>;
    static analyzeJobDescription(jobText: string): Promise<JobDescription>;
    static generateInterviewQuestions(resume: ResumeData, job: JobDescription): Promise<InterviewQuestion[]>;
    static generatePresentationTopics(resume: ResumeData, job: JobDescription): Promise<PresentationTopic[]>;
    static calculateATSScore(resume: ResumeData, job: JobDescription): Promise<ATSScore>;
    static generateInterviewResponse(userMessage: string, questionContext: any, resumeData: ResumeData, conversationHistory: string[]): Promise<string>;
    private static getMockResumeData;
    private static getMockJobDescription;
    private static getMockQuestions;
    private static getMockPresentations;
    private static getMockATSScore;
}
