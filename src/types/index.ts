import type { ReactNode, ElementType, JSX } from 'react';

/**
 * Core TypeScript interfaces and types for the AI Interview Prep application.
 * 
 * This module contains all type definitions used throughout the application,
 * organized by functional area (data models, components, state management).
 * 
 * @fileoverview Type definitions for AI Interview Prep application
 */

// ==================== CORE DATA INTERFACES ====================

/**
 * Represents parsed resume data structure
 * 
 * Contains all information extracted from a user's resume including
 * personal details, work experience, skills, and education.
 * 
 * @interface ResumeData
 */
export interface ResumeData {
  /** Full name of the candidate */
  name?: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** Professional summary or objective */
  summary?: string;
  /** Array of work experience entries */
  experience: ExperienceItem[];
  /** List of technical and soft skills */
  skills: string[];
  /** Educational background entries */
  education: EducationItem[];
  /** Professional certifications (optional) */
  certifications?: string[];
}

/**
 * Individual work experience entry from resume
 * 
 * @interface ExperienceItem
 */
export interface ExperienceItem {
  /** Company or organization name */
  company: string;
  /** Job title or position held */
  position: string;
  /** Employment duration (e.g., "Jan 2020 - Present") */
  duration: string;
  /** Array of job responsibilities and achievements */
  description: string[];
}

/**
 * Educational background entry
 * 
 * @interface EducationItem
 */
export interface EducationItem {
  /** Degree type and field of study */
  degree: string;
  /** Educational institution name */
  school: string;
  /** Graduation year or attendance period */
  year: string;
}

/**
 * Parsed job description structure
 * 
 * Contains structured information extracted from job postings
 * used for matching against candidate profiles.
 * 
 * @interface JobDescription
 */
export interface JobDescription {
  /** Job title */
  title: string;
  /** Hiring company name */
  company: string;
  /** Required qualifications and skills */
  requirements: string[];
  /** Key job responsibilities */
  responsibilities: string[];
  /** Nice-to-have skills and qualifications */
  preferredSkills: string[];
  /** Full job description text */
  description: string;
}

// ==================== INTERVIEW & PRESENTATION INTERFACES ====================

/**
 * AI-generated interview question with metadata
 * 
 * @interface InterviewQuestion
 */
export interface InterviewQuestion {
  /** Unique identifier for the question */
  id: string;
  /** Category of interview question */
  type: 'technical' | 'behavioral' | 'situational';
  /** The interview question text */
  question: string;
  /** AI-generated suggested response (optional) */
  suggestedAnswer?: string;
  /** Additional tips for answering (optional) */
  tips?: string[];
}

/**
 * Presentation topic with structured talking points
 * 
 * @interface PresentationTopic
 */
export interface PresentationTopic {
  /** Unique identifier for the topic */
  id: string;
  /** Presentation topic title */
  title: string;
  /** Array of key points to cover */
  bullets: string[];
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

/**
 * Represents a strategic question that candidates can ask interviewers
 * @interface CandidateQuestion
 */
export interface CandidateQuestion {
  /** Unique identifier for the question */
  id: string;
  /** Category of question to help organize them */
  category: 'role' | 'company' | 'team' | 'growth' | 'culture';
  /** The question text that candidates can ask */
  question: string;
  /** Why this question is strategic and what it reveals */
  rationale: string;
  /** The best time during interview to ask this question */
  timing: 'early' | 'middle' | 'end';
}

// App state interfaces
export interface AppState {
  resumeData: ResumeData | null;
  jobDescription: JobDescription | null;
  interviewQuestions: InterviewQuestion[];
  candidateQuestions: CandidateQuestion[];
  presentationTopics: PresentationTopic[];
  atsScore: ATSScore | null;
  isLoading: boolean;
  currentStep: 'upload' | 'analysis' | 'dashboard' | 'interview';
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
  // Accessibility props
  role?: string;
  'aria-selected'?: boolean;
  'aria-controls'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  tabIndex?: number;
  title?: string;
  onKeyDown?: (event: React.KeyboardEvent) => void;
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
