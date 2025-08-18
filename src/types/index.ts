import type { ReactNode, ElementType, JSX } from 'react';

// Core data interfaces
export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  experience: ExperienceItem[];
  skills: string[];
  education: EducationItem[];
  certifications?: string[];
}

export interface ExperienceItem {
  company: string;
  position: string;
  duration: string;
  description: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  year: string;
}

export interface JobDescription {
  title: string;
  company: string;
  requirements: string[];
  responsibilities: string[];
  preferredSkills: string[];
  description: string;
}

// Interview and presentation interfaces
export interface InterviewQuestion {
  id: string;
  type: 'technical' | 'behavioral' | 'situational';
  question: string;
  suggestedAnswer?: string;
  tips?: string[];
}

export interface PresentationTopic {
  id: string;
  title: string;
  bullets: string[];
  relevance: number;
}

// Analysis interfaces
export interface SkillMatch {
  skill: string;
  hasSkill: boolean;
  importance: 'required' | 'preferred' | 'nice-to-have';
}

export interface ATSScore {
  score: number;
  strengths: string[];
  improvements: string[];
  keywordMatches: string[];
  missingKeywords: string[];
}

// App state interfaces
export interface AppState {
  resumeData: ResumeData | null;
  jobDescription: JobDescription | null;
  interviewQuestions: InterviewQuestion[];
  presentationTopics: PresentationTopic[];
  atsScore: ATSScore | null;
  isLoading: boolean;
  currentStep: 'upload' | 'analysis' | 'dashboard';
  theme: 'light' | 'dark';
}

// Component prop types
export interface FileUploadProps {
  onDrop: (files: File[]) => void;
  file?: File | null;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  label?: string;
  description?: string;
  className?: string;
}

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  variant?: 'default' | 'elevated' | 'outlined';
  onClick?: () => void;
}

export interface TextProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption';
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent';
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'medium' | 'bold';
  className?: string;
  as?: ElementType<keyof JSX.IntrinsicElements>;
}
