import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Card } from '@atoms/Card';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import { FileUpload } from '@molecules/FileUpload';
import { DadJoke } from '@molecules/DadJoke';
import { Footer } from '@organisms/Footer';
import { DocumentParser } from '@/services/documentParser';
import { AIAnalysisService } from '@/services/aiAnalysis';
import { CacheService } from '@/services/cacheService';
import { useAppStore } from '@/store/appStore';
import { FiSun, FiMoon, FiUpload, FiFileText } from 'react-icons/fi';
import { LoadingOverlay } from './components/atoms/LoadingOverlay/LoadingOverlay';
import { SkillBubble } from './components/atoms/SkillBubble';
import { CookieConsent } from './components/molecules/CookieConsent';
import { CachePrompt } from './components/molecules/CachePrompt';
import { ToastProvider, useToast } from './components/organisms/ToastManager';
import type { CacheAvailability } from '@/services/cacheService';
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
    const [showCachePrompt, setShowCachePrompt] = useState(false);
    const [cacheAvailability, setCacheAvailability] = useState<CacheAvailability | null>(null);
    const [pendingAnalysisData, setPendingAnalysisData] = useState<{ resumeText: string; jobText: string } | null>(null);
    
    const { showSuccess } = useToast();
    
    const { 
        currentStep, 
        theme, 
        toggleTheme, 
        setCurrentStep, 
        setResumeData, 
        setJobDescription, 
        setInterviewQuestions, 
        setPresentationTopics, 
        setATSScore,
        setInterviewerRole,
        interviewerRole,
        interviewQuestions,
        presentationTopics,
        atsScore
    } = useAppStore();

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

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
     * 3. Cache checking for performance optimization
     * 4. AI analysis calls with parallel processing
     * 5. State updates and navigation to dashboard
     * 
     * Uses intelligent caching to avoid redundant API calls for identical content.
     * All AI operations run in parallel for optimal performance.
     * 
     * @async
     * @function
     * @throws {Error} When document parsing or AI analysis fails
     */
    /**
     * Checks for cached content availability and shows prompt if found
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
            // Parse documents first to check cache availability
            console.log('📄 Parsing documents...');
            const resumeText = await DocumentParser.parseResume(resumeFile);
            const jobText = jobFile ? await DocumentParser.parseResume(jobFile) : jobInput;
            
            // Check if we have cached content
            const availability = CacheService.checkCacheAvailability(resumeText, jobText);
            
            if (availability.hasResume || availability.hasJobDescription) {
                // Show cache prompt to user
                setCacheAvailability(availability);
                setPendingAnalysisData({ resumeText, jobText });
                setShowCachePrompt(true);
                return;
            }
            
            // No cache available, proceed with full analysis
            await performAnalysis(resumeText, jobText);
        } catch (err) {
            console.error('💥 Analysis error:', err);
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis. Check console for details.';
            setError(errorMessage);
        }
    };

    /**
     * Performs the actual analysis with caching
     */
    const performAnalysis = async (resumeText: string, jobText: string, useCache: boolean = true) => {
        setIsAnalyzing(true);
        setError('');
        
        // Store the interviewer role for use in interview responses
        setInterviewerRole(interviewerRole);
        
        try {
            // Phase 1: Resume analysis with caching optimization
            console.log('📄 Analyzing your resume...');
            let resumeData = useCache ? CacheService.getCachedResume(resumeText) : null;
            if (!resumeData) {
                console.log('🤖 AI is analyzing your resume...');
                resumeData = await AIAnalysisService.analyzeResume(resumeText);
                CacheService.cacheResume(resumeText, resumeData);
                showSuccess('Resume analysis cached successfully!');
            }
            setResumeData(resumeData);
            console.log('✅ Resume analysis complete!');
            
            // Phase 2: Job description analysis with caching optimization
            console.log('💼 Analyzing job description...');
            let jobData = useCache ? CacheService.getCachedJobDescription(jobText) : null;
            if (!jobData) {
                console.log('🤖 AI is analyzing job description...');
                jobData = await AIAnalysisService.analyzeJobDescription(jobText);
                CacheService.cacheJobDescription(jobText, jobData);
                showSuccess('Job description analysis cached successfully!');
            }
            setJobDescription(jobData);
            console.log('✅ Job analysis complete!');
            
            // Phase 3: Generate personalized content with parallel AI calls
            console.log('🎯 Generating your personalized interview prep...');
            const [questions, topics, atsScoreData] = await Promise.all([
                AIAnalysisService.generateInterviewQuestions(resumeData, jobData, interviewerRole),
                AIAnalysisService.generatePresentationTopics(resumeData, jobData),
                AIAnalysisService.calculateATSScore(resumeData, jobData)
            ]);
            
            // Update application state with results
            setInterviewQuestions(questions);
            setPresentationTopics(topics);
            setATSScore(atsScoreData);
            console.log('🎉 All done! Your interview prep is ready!');
            setCurrentStep('dashboard');
        } catch (err) {
            console.error('💥 Analysis error:', err);
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis. Check console for details.';
            setError(errorMessage);
        } finally {
            setIsAnalyzing(false);
        }
    };

    /**
     * Handle cache prompt responses
     */
    const handleCacheResponse = async (useCache: boolean) => {
        setShowCachePrompt(false);
        
        if (pendingAnalysisData) {
            const { resumeText, jobText } = pendingAnalysisData;
            await performAnalysis(resumeText, jobText, useCache);
            setPendingAnalysisData(null);
            setCacheAvailability(null);
        }
    };

    // Render Upload View
    if (currentStep === 'upload') {
        return (
            <>
                {isAnalyzing && <LoadingOverlay message={`Analyzing your resume and job description${interviewerRole ? ` for interview with ${formatInterviewerRole(interviewerRole)}` : ''}...`} />}
                <div className="app">
                    <header className="app-header">
                        <div className="header-content">
                            <Text as="h1" variant="h1" className="logo gradient-text">
                                AI Interview Prep
                            </Text>
                            <button
                                className="theme-toggle"
                                onClick={toggleTheme}
                                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
                            </button>
                        </div>
                    </header>
                    <main className="main-content">
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
                {showCachePrompt && cacheAvailability && (
                    <CachePrompt
                        isVisible={showCachePrompt}
                        cacheType={cacheAvailability.hasResume && cacheAvailability.hasJobDescription ? 'both' : 
                                  cacheAvailability.hasResume ? 'resume' : 'jobDescription'}
                        resumeFileName={cacheAvailability.resumeFileName}
                        jobDescriptionPreview={cacheAvailability.jobDescriptionPreview}
                        onUseCache={() => handleCacheResponse(true)}
                        onSkipCache={() => handleCacheResponse(false)}
                        onClose={() => setShowCachePrompt(false)}
                    />
                )}
            </>
        );
    }

    // Dashboard View
    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <div>
                        <Text as="h1" variant="h1" className="logo gradient-text">
                            Interview Dashboard
                        </Text>
                        <Text variant="body" color="secondary">
                            AI-Powered Personalized Preparation
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
                            <FiUpload className="button-icon" />
                            Start New
                        </Button>
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
                        </button>
                    </div>
                </div>
            </header>
            <main className="main-content">
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
                                {atsScore?.keywordMatches
                                    ? Math.round((atsScore.keywordMatches.length / (atsScore.keywordMatches.length + (atsScore.missingKeywords?.length || 0))) * 100)
                                    : 92}
                                <span className="hidden sm:inline">/100</span>
                                <span className="sm:hidden">%</span>
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
                    </div>
                    <div className="nav-tabs">
                        <Button
                            variant={activeTab === 'interview' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('interview')}
                        >
                            💬 Interview Q&A
                        </Button>
                        <Button
                            variant={activeTab === 'chat' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('chat')}
                        >
                            🤖 AI Interview Coach
                        </Button>
                        <Button
                            variant={activeTab === 'presentations' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('presentations')}
                        >
                            📈 Presentations
                        </Button>
                        <Button
                            variant={activeTab === 'skills' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('skills')}
                        >
                            🎯 Skills Analysis
                        </Button>
                        <Button
                            variant={activeTab === 'jokes' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('jokes')}
                        >
                            😄 Dad Jokes
                        </Button>
                    </div>
                    <div className="content-area">
                        {activeTab === 'interview' && (
                            <div className="content-section">
                                <div className="content-cards-container">
                                    {interviewQuestions?.map((question) => (
                                        <div key={question.id} className="content-card question-card">
                                            <div className="question-text">{question.question}</div>
                                            {question.suggestedAnswer && (
                                                <div className="suggested-answer">
                                                    <div className="answer-label">Suggested Answer:</div>
                                                    <Text variant="body">{question.suggestedAnswer}</Text>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'skills' && (
                            <div className="content-section">
                                <div className="skills-analysis-modern">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                                        <div className="skills-card-modern">
                                            <div className="skills-card-header">
                                                <div className="skills-card-icon strengths">✓</div>
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
                                                <div className="skills-card-icon improvements">!</div>
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
                                        <div className="skills-card-modern">
                                            <div className="skills-card-header">
                                                <div className="skills-card-icon matches">✓</div>
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
                                                <div className="skills-card-icon missing">!</div>
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
                        {activeTab === 'jokes' && (
                            <div className="content-section">
                                <DadJoke />
                            </div>
                        )}
                    </div>
                </div>
            </main>
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