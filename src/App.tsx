import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Card } from '@atoms/Card';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import { SpeechButton } from '@atoms/SpeechButton';
import { FileUpload } from '@molecules/FileUpload';
import { DadJoke } from '@molecules/DadJoke';
import { Footer } from '@organisms/Footer';
import { DocumentParser } from '@/services/documentParser';
import { AIAnalysisService } from '@/services/aiAnalysis';
import { DadJokeService } from '@/services/dadJokeService';
import { useAppStore } from '@/store/appStore';
import type { InterviewQuestion, PresentationTopic, CandidateQuestion } from '@/types';
import { ThemeSelector } from '@atoms/ThemeSelector';
import { FiUpload, FiFileText } from 'react-icons/fi';
import { LoadingOverlay } from './components/atoms/LoadingOverlay/LoadingOverlay';
import { SkillBubble } from './components/atoms/SkillBubble';
import { CookieConsent } from './components/molecules/CookieConsent';
import { ToastProvider } from './components/organisms/ToastManager';
import './App.css';

// Lazy load heavy components
const InterviewChat = lazy(() => import('@organisms/InterviewChat').then(module => ({
  default: module.InterviewChat
})));

/**
 * Main Application Component
 * 
 * The root component that handles the core functionality of the AI Interview Prep application.
 * Manages the two main views: upload/analysis view and dashboard view.
 * 
 * Features:
 * - File upload for resume and job descriptions
 * - AI-powered analysis of documents
 * - Caching system for performance optimization
 * - Theme switching (light/dark mode)
 * - Multi-step workflow management
 * - Real-time loading states and error handling
 * 
 * @component
 * @returns {JSX.Element} The rendered application
 */
const AppContent = () => {
    // State management
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jobInput, setJobInput] = useState('');
    const [jobFile, setJobFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('interview');
    
    
    const { 
        currentStep, 
        theme, 
        setTheme, 
        setCurrentStep, 
        setResumeData, 
        setJobDescription, 
        setInterviewQuestions, 
        setPresentationTopics, 
        setCandidateQuestions,
        setATSScore,
        setInterviewerRole,
        interviewerRole,
        interviewQuestions,
        presentationTopics,
        candidateQuestions,
        atsScore
    } = useAppStore();

    useEffect(() => {
        // Remove any existing theme classes
        document.body.className = document.body.className
            .split(' ')
            .filter(cls => !cls.startsWith('theme-'))
            .join(' ');
        
        // Add new theme class
        document.body.classList.add(`theme-${theme}`);
        
        // Also set data attribute for backward compatibility
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    // Preload dad jokes on app initialization
    useEffect(() => {
        DadJokeService.preloadJokes();
    }, []);

    /**
     * Formats interviewer role for display in loading message
     */
    const formatInterviewerRole = (role: string): string => {
        const roleMap: Record<string, string> = {
            'recruiter': 'Recruiter',
            'hiring-manager': 'Hiring Manager',
            'tech-lead': 'Technical Lead',
            'program-manager': 'Program Manager',
            'product-manager': 'Product Manager',
            'team-member': 'Team Member',
            'director': 'Director',
            'cto': 'CTO',
            'other': 'Other'
        };
        return roleMap[role] || role;
    };

    /**
     * Check if analysis data exists (indicating previous analysis was completed)
     */
    const hasExistingAnalysis = (): boolean => {
        return !!(interviewQuestions.length > 0 || presentationTopics.length > 0 || atsScore);
    };

    /**
     * Handles resume file upload
     * 
     * Processes the uploaded resume file and clears any previous errors.
     * Only accepts the first file if multiple files are dropped.
     * 
     * @param {File[]} files - Array of uploaded files
     */
    const handleResumeUpload = (files: File[]) => {
        if (files.length > 0) {
            setResumeFile(files[0]);
            setError('');
        }
    };

    /**
     * Handles job description file upload
     * 
     * Processes the uploaded job description file and clears the text input
     * to prevent confusion between file and text input methods.
     * 
     * @param {File[]} files - Array of uploaded files
     */
    const handleJobFileUpload = (files: File[]) => {
        if (files.length > 0) {
            setJobFile(files[0]);
            setJobInput(''); // Clear text input when file is uploaded
            setError('');
        }
    };


    /**
     * Main analysis handler
     * 
     * Orchestrates the complete analysis workflow including:
     * 1. Input validation
     * 2. Document parsing (resume and job description)
     * 3. AI analysis calls with parallel processing
     * 4. State updates and navigation to dashboard
     * 
     * All AI operations run in parallel for optimal performance.
     * 
     * @async
     * @function
     * @throws {Error} When document parsing or AI analysis fails
     */
    const handleAnalyze = async () => {
        // Input validation
        if (!resumeFile) {
            setError('Please upload your resume');
            return;
        }
        if (!jobInput && !jobFile) {
            setError('Please provide a job description');
            return;
        }
        
        setError('');
        
        try {
            // Parse documents
            // Parsing documents
            const resumeText = await DocumentParser.parseResume(resumeFile);
            const jobText = jobFile ? await DocumentParser.parseResume(jobFile) : jobInput;
            
            // Proceed with analysis
            await performAnalysis(resumeText, jobText);
        } catch (err) {
            console.error('💥 Analysis error:', err);
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis. Check console for details.';
            setError(errorMessage);
        }
    };

    /**
     * Performs the actual analysis using a single consolidated API call
     */
    const performAnalysis = async (resumeText: string, jobText: string) => {
        setIsAnalyzing(true);
        setError('');
        
        // Store the interviewer role for use in interview responses
        setInterviewerRole(interviewerRole);
        
        try {
            // Starting comprehensive analysis
            
            // Single consolidated API call for all analysis
            const analysis = await AIAnalysisService.performConsolidatedAnalysis(resumeText, jobText);
            
            // Update resume data with a basic structure that matches the type
            setResumeData({
                skills: analysis.strengths || [],
                experience: [], // These would be parsed from resumeText in a real implementation
                education: [],
                summary: ''
            });
            
            // Update job description with a basic structure that matches the type
            setJobDescription({
                title: 'Target Position',
                company: 'Target Company',
                requirements: [],
                responsibilities: [],
                preferredSkills: [],
                description: jobText
            });
            
            // Map technical questions to match InterviewQuestion type
            const technicalQuestions: InterviewQuestion[] = analysis.technicalQuestions.map((q, i) => ({
                id: `q-${i}`,
                type: 'technical',
                question: q.question,
                suggestedAnswer: q.answer,
                tips: []
            }));
            
            // Map behavioral questions to match InterviewQuestion type
            const behavioralQuestions: InterviewQuestion[] = analysis.behavioralQuestions.map((q, i) => ({
                id: `bq-${i}`,
                type: 'behavioral',
                question: q.question,
                suggestedAnswer: q.answer,
                tips: []
            }));
            
            // Combine and set all questions
            setInterviewQuestions([...technicalQuestions, ...behavioralQuestions]);
            
            // Map presentation topics to match PresentationTopic type
            const mappedPresentationTopics: PresentationTopic[] = analysis.presentationTopics.map((topic, i) => ({
                id: `topic-${i}`,
                title: topic.topic,
                bullets: topic.keyPoints
            }));
            
            setPresentationTopics(mappedPresentationTopics);
            
            // Map candidate questions to match CandidateQuestion type
            const mappedCandidateQuestions: CandidateQuestion[] = analysis.candidateQuestions.map((q, i) => ({
                id: `cq-${i}`,
                question: q,
                category: 'role', // Default category
                rationale: 'This question helps understand the role and company better.',
                timing: 'end' as const
            }));
            
            setCandidateQuestions(mappedCandidateQuestions);
            
            // Set ATS score with proper type
            setATSScore({
                score: analysis.atsScore.score,
                strengths: analysis.atsScore.strengths,
                improvements: analysis.atsScore.improvements,
                keywordMatches: analysis.atsScore.keywordMatches || [],
                missingKeywords: analysis.atsScore.missingKeywords || []
            });
            
            // Analysis complete - interview prep is ready
            setCurrentStep('dashboard');
        } catch (err) {
            console.error('💥 Analysis error:', err);
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis. Check console for details.';
            setError(errorMessage);
        } finally {
            setIsAnalyzing(false);
        }
    };


    // Render Upload View
    if (currentStep === 'upload') {
        return (
            <>
                {isAnalyzing && <LoadingOverlay message={`Analyzing your resume and job description${interviewerRole ? ` for an interview with a ${formatInterviewerRole(interviewerRole)}` : ''}...`} />}
                <div className="app">
                    <header className="app-header">
                        <div className="header-content">
                            <Text as="h1" variant="h1" className="logo gradient-text">
                                AI Interview Prep
                            </Text>
                            <div className="theme-selector-wrapper">
                                <span className="theme-selector-label">Theme:</span>
                                <ThemeSelector 
                                    currentTheme={theme}
                                    onThemeChange={setTheme}
                                />
                            </div>
                        </div>
                    </header>
                    <main className="main-content">
                        {hasExistingAnalysis() && currentStep === 'upload' && (
                            <Card className="current-analysis-section">
                                <div className="current-analysis-header">
                                    <Text as="h2" variant="h2" className="section-header">
                                        📊 Current Analysis Available
                                    </Text>
                                    <Text variant="body" color="secondary" className="current-analysis-description">
                                        You have an existing analysis ready. View your dashboard or start a new analysis below.
                                    </Text>
                                </div>
                                <div className="current-analysis-stats">
                                    {atsScore && (
                                        <div className="analysis-stat">
                                            <span className="stat-label">ATS Score:</span>
                                            <span className="stat-value">{atsScore.score}/100</span>
                                        </div>
                                    )}
                                    {interviewQuestions.length > 0 && (
                                        <div className="analysis-stat">
                                            <span className="stat-label">Questions:</span>
                                            <span className="stat-value">{interviewQuestions.length}</span>
                                        </div>
                                    )}
                                    {presentationTopics.length > 0 && (
                                        <div className="analysis-stat">
                                            <span className="stat-label">Topics:</span>
                                            <span className="stat-value">{presentationTopics.length}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="current-analysis-actions">
                                    <Button
                                        variant="primary"
                                        size="medium"
                                        onClick={() => setCurrentStep('dashboard')}
                                        className="view-dashboard-btn"
                                    >
                                        View Dashboard
                                    </Button>
                                </div>
                            </Card>
                        )}
                        <div className="grid-container">
                            <Card className="upload-section">
                                <Text as="h2" variant="h2" className="section-header">
                                    <FiUpload className="icon" /> Upload Your Resume
                                </Text>
                                <FileUpload
                                    onDrop={handleResumeUpload}
                                    accept={{
                                        'application/pdf': ['.pdf'],
                                        'application/msword': ['.doc'],
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                                    }}
                                    maxFiles={1}
                                    label="📄 Upload your resume"
                                    description="PDF, DOC, DOCX files up to 5MB"
                                />
                                {resumeFile && (
                                    <div className="file-preview">
                                        <FiFileText className="file-icon" />
                                        <span>{resumeFile.name}</span>
                                    </div>
                                )}
                            </Card>

                            <Card className="upload-section">
                                <Text as="h2" variant="h2" className="section-header">
                                    <FiFileText className="icon" /> Job Description
                                </Text>
                                <div className="job-input-container">
                                    <div className="paste-section">
                                        <Text as="h3" variant="h3" className="subsection-header">
                                            📝 Paste Job Description
                                        </Text>
                                        <Text variant="small" color="secondary" className="subsection-description">
                                            Copy and paste the job description text or URL below
                                        </Text>
                                        <textarea
                                            className="job-textarea"
                                            placeholder="Paste job description text or URL here..."
                                            value={jobInput}
                                            onChange={(e) => {
                                                setJobInput(e.target.value);
                                                if (e.target.value && jobFile) {
                                                    setJobFile(null); // Clear file when typing
                                                }
                                            }}
                                            rows={4}
                                            disabled={!!jobFile}
                                        />
                                    </div>
                                    {jobFile && (
                                        <div className="file-preview">
                                            <FiFileText className="file-icon" />
                                            <span>{jobFile.name}</span>
                                            <button 
                                                onClick={() => setJobFile(null)}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                                title="Remove file"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="stylish-hr-or"></div>
                                <div className="upload-section">
                                    <div className="upload-subsection">
                                        <Text as="h3" variant="h3" className="subsection-header">
                                            📄 Upload Job Description File
                                        </Text>
                                        <Text variant="small" color="secondary" className="subsection-description">
                                            Upload a PDF, DOC, DOCX, or TXT file containing the job description
                                        </Text>
                                        {!jobInput.trim() && (
                                            <FileUpload
                                                onDrop={handleJobFileUpload}
                                                accept={{
                                                    'application/pdf': ['.pdf'],
                                                    'application/msword': ['.doc'],
                                                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                                    'text/plain': ['.txt']
                                                }}
                                                maxFiles={1}
                                                label="💼 Drop files here or click to browse"
                                                description="PDF, DOC, DOCX, TXT files up to 5MB"
                                            />
                                        )}
                                        {jobInput.trim() && (
                                            <div className="upload-disabled-message">
                                                <Text variant="small" color="secondary" className="text-center">
                                                    File upload disabled while text is entered. Clear the text above to upload a file instead.
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <Card className="upload-section">
                                <Text as="h2" variant="h2" className="section-header">
                                    <FiFileText className="icon" /> Interviewer Role (Optional)
                                </Text>
                                <div className="job-input-container">
                                    <select
                                        className="job-textarea"
                                        value={interviewerRole}
                                        onChange={(e) => setInterviewerRole(e.target.value)}
                                        style={{ height: '44px', padding: '4px 12px', resize: 'none' }}
                                    >
                                        <option value="">Select interviewer role (optional)</option>
                                        <option value="recruiter">Recruiter / HR Representative</option>
                                        <option value="hiring-manager">Hiring Manager</option>
                                        <option value="tech-lead">Technical Lead / Senior Engineer</option>
                                        <option value="program-manager">Program Manager</option>
                                        <option value="product-manager">Product Manager</option>
                                        <option value="team-member">Team Member / Peer</option>
                                        <option value="director">Director / VP</option>
                                        <option value="cto">CTO / Chief Technology Officer</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <Text variant="small" color="secondary" className="mt-2">
                                        💡 This helps tailor interview questions to the interviewer's perspective and priorities
                                    </Text>
                                </div>
                            </Card>
                        </div>

                        <div className="action-container">
                            <Button
                                variant="primary"
                                size="large"
                                onClick={handleAnalyze}
                                disabled={!resumeFile || (!jobInput && !jobFile) || isAnalyzing}
                                className="analyze-button green-button"
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
                            </Button>
                        </div>


                        {error && (
                            <div className="p-3 bg-red-50 rounded-md mt-4">
                                <Text as="div" variant="body" color="primary" className="text-red-600">{error}</Text>
                            </div>
                        )}

                        <div className="dad-joke-section">
                            <div className="stylish-hr"></div>
                            <DadJoke />
                        </div>
                    </main>
                    <Footer />
                </div>
                <CookieConsent />
            </>
        );
    }

    // Dashboard View
    return (
        <div className="app">
            <a href="#main-content" className="skip-nav">
                Skip to main content
            </a>
            <header className="app-header" role="banner">
                <div className="header-content">
                    <div>
                        <Text as="h1" variant="h1" className="logo gradient-text">
                            Interview Dashboard
                        </Text>
                        <Text variant="body" color="secondary">
                            AI-Powered Personalized Interview Prep
                        </Text>
                    </div>
                    <div className="header-actions">
                        <Button
                            variant="primary"
                            size="medium"
                            onClick={() => setCurrentStep('dashboard')}
                            className="current-analysis-btn"
                        >
                            Current Analysis
                        </Button>
                        <Button
                            variant="secondary"
                            size="medium"
                            onClick={() => setCurrentStep('upload')}
                            className="new-analysis-btn green-button"
                        >
                            Start New
                        </Button>
                        <div className="theme-selector-wrapper">
                            <span className="theme-selector-label">Theme:</span>
                            <ThemeSelector 
                                currentTheme={theme}
                                onThemeChange={setTheme}
                            />
                        </div>
                    </div>
                </div>
            </header>
            <div className="main-content">
                <div className="container">
                    <div className="stats-grid">
                        <Card className="stat-card">
                            <div className="emoji">📊</div>
                            <div className="score">
                                {atsScore?.score || 85}
                            </div>
                            <div className="label">ATS Score <small>(Applicant Tracking System)</small></div>
                        </Card>
                        <Card className="stat-card">
                            <div className="emoji">🎯</div>
                            <div className="score">
                                {atsScore?.keywordMatches ? (
                                    <>
                                        <span className="desktop-fraction">
                                            {atsScore.keywordMatches.length}/{atsScore.keywordMatches.length + (atsScore.missingKeywords?.length || 0)}
                                        </span>
                                        <span className="mobile-percentage">
                                            {Math.round((atsScore.keywordMatches.length / (atsScore.keywordMatches.length + (atsScore.missingKeywords?.length || 0))) * 100)}%
                                        </span>
                                    </>
                                ) : 'N/A'}
                            </div>
                            <div className="label">Skill Match</div>
                        </Card>
                        <Card className="stat-card">
                            <div className="emoji">📄</div>
                            <div className="score">
                                {presentationTopics.length || 3}
                            </div>
                            <div className="label">Topics</div>
                        </Card>
                        <Card className="stat-card">
                            <div className="emoji">❓</div>
                            <div className="score">
                                {interviewQuestions.length || 6}
                            </div>
                            <div className="label">Questions</div>
                        </Card>
                        <Card className="stat-card">
                            <div className="emoji">💡</div>
                            <div className="score">
                                {candidateQuestions?.length || 5}
                            </div>
                            <div className="label">Questions to Ask</div>
                        </Card>
                    </div>
                    <nav className="nav-tabs" role="tablist" aria-label="Interview preparation sections">
                        <Button
                            variant={activeTab === 'interview' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('interview')}
                            role="tab"
                            aria-selected={activeTab === 'interview'}
                            aria-controls="interview-panel"
                        >
                            💬 Interview Q&A
                        </Button>
                        <Button
                            variant={activeTab === 'chat' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('chat')}
                            role="tab"
                            aria-selected={activeTab === 'chat'}
                            aria-controls="chat-panel"
                        >
                            🤖 AI Interview Coach
                        </Button>
                        <Button
                            variant={activeTab === 'presentations' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('presentations')}
                            role="tab"
                            aria-selected={activeTab === 'presentations'}
                            aria-controls="presentations-panel"
                        >
                            📈 Presentations
                        </Button>
                        <Button
                            variant={activeTab === 'questions' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('questions')}
                            role="tab"
                            aria-selected={activeTab === 'questions'}
                            aria-controls="questions-panel"
                        >
                            💡 Questions to Ask
                        </Button>
                        <Button
                            variant={activeTab === 'skills' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('skills')}
                            role="tab"
                            aria-selected={activeTab === 'skills'}
                            aria-controls="skills-panel"
                        >
                            🎯 Skills Analysis
                        </Button>
                        <Button
                            variant={activeTab === 'jokes' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('jokes')}
                            role="tab"
                            aria-selected={activeTab === 'jokes'}
                            aria-controls="jokes-panel"
                        >
                            😄 Dad Jokes
                        </Button>
                    </nav>
                    <main id="main-content" className="content-area">
                        {activeTab === 'interview' && (
                            <section 
                                id="interview-panel" 
                                role="tabpanel" 
                                aria-labelledby="interview-tab"
                                className="content-section"
                            >
                                <div className="content-cards-container">
                                    {interviewQuestions?.map((question) => (
                                        <article key={question.id} className="content-card question-card" role="article" aria-labelledby={`question-${question.id}`}>
                                            <div className="question-text">{question.question}</div>
                                            {question.suggestedAnswer && (
                                                <div className="suggested-answer">
                                                    <div className="answer-label">Suggested Answer:</div>
                                                    <Text variant="body">{question.suggestedAnswer}</Text>
                                                </div>
                                            )}
                                            <div className="speech-controls">
                                                <SpeechButton 
                                                    text={`${question.question}${question.suggestedAnswer ? `. Suggested Answer: ${question.suggestedAnswer}` : ''}`}
                                                    size="small"
                                                    variant="ghost"
                                                    showLabel={false}
                                                    className="content-speech-button"
                                                />
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}
                        {activeTab === 'skills' && (
                            <div className="content-section">
                                <div className="skills-analysis-modern">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                                        <div className="skills-card-modern">
                                            <div className="skills-card-header">
                                                <div className="skills-card-icon strengths">✨</div>
                                                <Text variant="h3" className="font-bold">Strengths</Text>
                                            </div>
                                            <ul className="skills-list-modern">
                                                {atsScore?.strengths?.map((strength, i) => (
                                                    <li key={i}>
                                                        <div className="skills-list-indicator strengths"></div>
                                                        <Text variant="body">{strength}</Text>
                                                    </li>
                                                )) || (
                                                    <>
                                                        <li>
                                                            <div className="skills-list-indicator strengths"></div>
                                                            <Text variant="body">Strong technical skills match</Text>
                                                        </li>
                                                        <li>
                                                            <div className="skills-list-indicator strengths"></div>
                                                            <Text variant="body">Relevant experience</Text>
                                                        </li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                        <div className="skills-card-modern">
                                            <div className="skills-card-header">
                                                <div className="skills-card-icon improvements">🔧</div>
                                                <Text variant="h3" className="font-bold">Improvements</Text>
                                            </div>
                                            <ul className="skills-list-modern">
                                                {atsScore?.improvements?.map((improvement, i) => (
                                                    <li key={i}>
                                                        <div className="skills-list-indicator improvements"></div>
                                                        <Text variant="body">{improvement}</Text>
                                                    </li>
                                                )) || (
                                                    <>
                                                        <li>
                                                            <div className="skills-list-indicator improvements"></div>
                                                            <Text variant="body">Add quantifiable achievements</Text>
                                                        </li>
                                                        <li>
                                                            <div className="skills-list-indicator improvements"></div>
                                                            <Text variant="body">Include industry keywords</Text>
                                                        </li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
                                        <div className="skills-card-modern">
                                            <div className="skills-card-header">
                                                <div className="skills-card-icon matches">✅</div>
                                                <Text variant="h3" className="font-bold">Keyword Matches</Text>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {atsScore?.keywordMatches?.map((keyword, i) => (
                                                    <SkillBubble key={i} variant="success">
                                                        {keyword}
                                                    </SkillBubble>
                                                )) || (
                                                    <>
                                                        <SkillBubble variant="success">React</SkillBubble>
                                                        <SkillBubble variant="success">Node.js</SkillBubble>
                                                        <SkillBubble variant="success">JavaScript</SkillBubble>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="skills-card-modern">
                                            <div className="skills-card-header">
                                                <div className="skills-card-icon missing">❌</div>
                                                <Text variant="h3" className="font-bold">Missing Keywords</Text>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {atsScore?.missingKeywords?.map((keyword, i) => (
                                                    <SkillBubble key={i} variant="warning">
                                                        {keyword}
                                                    </SkillBubble>
                                                )) || (
                                                    <>
                                                        <SkillBubble variant="warning">Docker</SkillBubble>
                                                        <SkillBubble variant="warning">GraphQL</SkillBubble>
                                                        <SkillBubble variant="warning">Kubernetes</SkillBubble>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'chat' && (
                            <div className="content-section">
                                <Suspense fallback={<div className="loading-placeholder">Loading Interview Chat...</div>}>
                                    <InterviewChat />
                                </Suspense>
                            </div>
                        )}
                        {activeTab === 'presentations' && (
                            <div className="content-section">
                                <div className="content-cards-container">
                                    {presentationTopics?.length > 0 ? (
                                        presentationTopics.map((topic) => (
                                            <div key={topic.id} className="content-card topic-card">
                                                <div className="topic-title">{topic.title}</div>
                                                <ul className="topic-bullets">
                                                    {topic.bullets.map((bullet, i) => (
                                                        <li key={i}>
                                                            <Text variant="body">{bullet}</Text>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="speech-controls">
                                                    <SpeechButton 
                                                        text={`${topic.title}. ${topic.bullets.join('. ')}`} 
                                                        size="small"
                                                        variant="ghost"
                                                        showLabel={false}
                                                        className="content-speech-button"
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="content-card topic-card" style={{ textAlign: 'center' }}>
                                            <Text variant="body" color="secondary">
                                                No presentation topics generated yet. Please analyze a job description first.
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'questions' && (
                            <div className="content-section">
                                <div className="content-cards-container">
                                    {candidateQuestions?.length > 0 ? (
                                        candidateQuestions.map((question) => (
                                            <div key={question.id} className="content-card question-card candidate-question-card">
                                                <div className="question-category">
                                                    <span className={`category-badge ${question.category}`}>
                                                        {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                                                    </span>
                                                    <span className={`timing-badge ${question.timing}`}>
                                                        {question.timing.charAt(0).toUpperCase() + question.timing.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="question-text">{question.question}</div>
                                                <div className="question-rationale">
                                                    <div className="rationale-label">Why ask this:</div>
                                                    <Text variant="body" color="secondary">{question.rationale}</Text>
                                                </div>
                                                <div className="speech-controls">
                                                    <SpeechButton 
                                                        text={`${question.question}. Why ask this: ${question.rationale}`}
                                                        size="small"
                                                        variant="ghost"
                                                        showLabel={false}
                                                        className="content-speech-button"
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="content-card question-card" style={{ textAlign: 'center' }}>
                                            <Text variant="body" color="secondary">
                                                No candidate questions generated yet. Please analyze a job description first.
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'jokes' && (
                            <div className="content-section">
                                <DadJoke />
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <Footer />
            <CookieConsent />
        </div>
    );
};

/**
 * Main App Component with Toast Provider
 * 
 * Wraps the entire application with ToastProvider for global toast notifications.
 * This allows any component in the app to show toast messages.
 * 
 * @returns JSX element with toast context provider
 */
const App: React.FC = () => {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
};

export default App;