import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card } from '@atoms/Card';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import { FileUpload } from '@molecules/FileUpload';
import { DadJoke } from '@molecules/DadJoke';
import { InterviewChat } from '@organisms/InterviewChat';
import { Footer } from '@organisms/Footer';
import { DocumentParser } from './services/documentParser';
import { AIAnalysisService } from './services/aiAnalysis';
import { useAppStore } from './store/appStore';
import { FiSun, FiMoon, FiUpload, FiFileText, FiAward, FiMessageSquare, FiChevronRight } from 'react-icons/fi';
import './App.css';
const App = () => {
    // ... existing code ...
    const [resumeFile, setResumeFile] = useState(null);
    const [jobInput, setJobInput] = useState('');
    const [jobFile, setJobFile] = useState(null);
    const [jobUrl, setJobUrl] = useState('');
    const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [_, setError] = useState('');
    const [activeTab, setActiveTab] = useState('interview');
    const { currentStep, theme, toggleTheme, setCurrentStep, setResumeData, setJobDescription, setInterviewQuestions, setPresentationTopics, setATSScore, atsScore, interviewQuestions, presentationTopics } = useAppStore();
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);
    const handleResumeUpload = (files) => {
        if (files.length > 0) {
            setResumeFile(files[0]);
            setError('');
        }
    };
    const handleJobUpload = (files) => {
        if (files.length > 0) {
            setJobFile(files[0]);
            setJobInput('');
            setJobUrl('');
        }
    };
    const handleJobUrlSubmit = async (e) => {
        e.preventDefault();
        if (!jobUrl.trim())
            return;
        try {
            // Simple URL validation
            new URL(jobUrl);
            setIsAnalyzingUrl(true);
            setJobInput('');
            setJobFile(null);
            // Fetch and analyze the job description from URL
            const jobText = await DocumentParser.fetchJobDescription(jobUrl);
            const jobData = await AIAnalysisService.analyzeJobDescription(jobText);
            setJobDescription(jobData);
            // If we have a resume, analyze it with the job description
            if (resumeFile) {
                await handleAnalyze();
            }
        }
        catch (err) {
            console.error('Error processing job URL:', err);
            setError(err.message || 'Failed to process job URL. Please try again.');
        }
        finally {
            setIsAnalyzingUrl(false);
        }
    };
    const handleAnalyze = async () => {
        if (!resumeFile) {
            setError('Please upload your resume');
            return;
        }
        if (!jobInput && !jobFile && !jobUrl) {
            setError('Please provide a job description');
            return;
        }
        setIsAnalyzing(true);
        setError('');
        try {
            // Parse resume
            const resumeText = await DocumentParser.parseResume(resumeFile);
            console.log('Resume parsed, analyzing with AI...');
            const resumeData = await AIAnalysisService.analyzeResume(resumeText);
            setResumeData(resumeData);
            // Parse job description
            const jobText = jobFile
                ? await DocumentParser.parseResume(jobFile)
                : jobUrl
                    ? await DocumentParser.fetchJobDescription(jobUrl)
                    : await DocumentParser.fetchJobDescription(jobInput);
            console.log('Job description parsed, analyzing with AI...');
            const jobData = await AIAnalysisService.analyzeJobDescription(jobText);
            setJobDescription(jobData);
            // Generate personalized content with real AI
            console.log('Generating interview questions with AI...');
            const [questions, topics, atsScoreData] = await Promise.all([
                AIAnalysisService.generateInterviewQuestions(resumeData, jobData),
                AIAnalysisService.generatePresentationTopics(resumeData, jobData),
                AIAnalysisService.calculateATSScore(resumeData, jobData)
            ]);
            setInterviewQuestions(questions);
            setPresentationTopics(topics);
            setATSScore(atsScoreData);
            setCurrentStep('dashboard');
        }
        catch (err) {
            console.error('Analysis error:', err);
            setError(err.message || 'An error occurred during analysis. Check console for details.');
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    // Render Upload View
    if (currentStep === 'upload') {
        return (_jsxs("div", { className: "app", children: [_jsx("header", { className: "app-header", children: _jsxs("div", { className: "header-content", children: [_jsx(Text, { as: "h1", variant: "h1", className: "logo", children: _jsx(Text, { variant: "h1", as: "h1", className: "gradient-text", children: "AI Interview Prep" }) }), _jsx("button", { className: "theme-toggle", onClick: toggleTheme, "aria-label": `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`, children: theme === 'light' ? _jsx(FiMoon, { size: 20 }) : _jsx(FiSun, { size: 20 }) })] }) }), _jsxs("main", { className: "main-content", children: [_jsxs("div", { className: "grid-container", children: [_jsxs(Card, { className: "upload-section", children: [_jsxs(Text, { as: "h2", variant: "h2", className: "section-header", children: [_jsx(FiUpload, { className: "icon" }), " Upload Your Resume"] }), _jsx(FileUpload, { onDrop: handleResumeUpload, accept: {
                                                'application/pdf': ['.pdf'],
                                                'application/msword': ['.doc'],
                                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                                            }, maxFiles: 1, label: "Drag & drop your resume here", description: "Supports PDF, DOC, DOCX (Max 5MB)" }), resumeFile && (_jsxs("div", { className: "file-preview", children: [_jsx(FiFileText, { className: "file-icon" }), _jsx("span", { children: resumeFile.name })] }))] }), _jsxs(Card, { className: "upload-section", children: [_jsxs(Text, { as: "h2", variant: "h2", className: "section-header", children: [_jsx(FiFileText, { className: "icon" }), " Job Description"] }), _jsxs("div", { className: "job-input-container", children: [_jsx("form", { onSubmit: handleJobUrlSubmit, className: "flex flex-col gap-3", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "url", className: "job-textarea flex-1", value: jobUrl, onChange: (e) => setJobUrl(e.target.value), placeholder: "Enter job posting URL (e.g., LinkedIn, Indeed, company career page)", required: true }), _jsx(Button, { type: "submit", variant: "primary", disabled: isAnalyzingUrl, children: isAnalyzingUrl ? 'Analyzing...' : 'Analyze' })] }) }), _jsx("div", { className: "divider", children: "or" }), _jsx(FileUpload, { onDrop: handleJobUpload, accept: {
                                                        'application/pdf': ['.pdf'],
                                                        'application/msword': ['.doc'],
                                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                                        'text/plain': ['.txt']
                                                    }, maxFiles: 1, children: _jsxs(Button, { variant: "secondary", size: "medium", fullWidth: true, children: [_jsx(FiUpload, { className: "button-icon" }), " Upload Job Description"] }) }), _jsx("div", { className: "divider", children: "or" }), _jsx("textarea", { className: "job-textarea", value: jobInput, onChange: (e) => setJobInput(e.target.value), placeholder: "Or paste job description here..." })] }), jobFile && (_jsxs("div", { className: "file-preview", children: [_jsx(FiFileText, { className: "file-icon" }), _jsx("span", { children: jobFile.name })] }))] })] }), _jsx("div", { className: "action-container", children: _jsxs(Button, { variant: "primary", size: "large", onClick: handleAnalyze, disabled: !resumeFile || (!jobInput && !jobFile && !jobUrl) || isAnalyzing, className: "analyze-button", children: [isAnalyzing ? 'Analyzing...' : 'Start Analysis', _jsx(FiChevronRight, { className: "button-icon" })] }) }), _jsxs("div", { className: "features-grid", children: [_jsxs(Card, { className: "feature-card", children: [_jsx("div", { className: "feature-icon", children: _jsx(FiMessageSquare, {}) }), _jsx(Text, { as: "h3", variant: "h3", children: "AI-Powered Questions" }), _jsx(Text, { variant: "body", color: "secondary", children: "Get personalized interview questions based on your resume and job description." })] }), _jsxs(Card, { className: "feature-card", children: [_jsx("div", { className: "feature-icon", children: _jsx(FiAward, {}) }), _jsx(Text, { as: "h3", variant: "h3", children: "ATS Score" }), _jsx(Text, { variant: "body", color: "secondary", children: "See how well your resume matches the job requirements with our ATS scoring system." })] })] }), _jsx("div", { className: "text-center", children: _jsx(DadJoke, {}) })] }), _jsx(Footer, {})] }));
    }
    // Dashboard View
    return (_jsxs("div", { className: "app", children: [_jsx("header", { className: "app-header", children: _jsxs("div", { className: "header-content", children: [_jsxs("div", { children: [_jsx(Text, { as: "h1", variant: "h1", className: "logo", children: _jsx(Text, { variant: "h1", as: "h1", className: "gradient-text", children: "Interview Dashboard" }) }), _jsx(Text, { variant: "body", color: "secondary", children: "AI-Powered Personalized Preparation" })] }), _jsxs("div", { className: "header-actions", children: [_jsxs(Button, { variant: "secondary", size: "medium", onClick: () => setCurrentStep('upload'), className: "new-analysis-btn", children: [_jsx(FiUpload, { className: "button-icon" }), " New Analysis"] }), _jsx("button", { className: "theme-toggle", onClick: toggleTheme, "aria-label": `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`, children: theme === 'light' ? _jsx(FiMoon, { size: 20 }) : _jsx(FiSun, { size: 20 }) })] })] }) }), _jsx("main", { className: "main-content", children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "stats-grid", children: [_jsxs(Card, { className: "stat-card", children: [_jsx(Text, { variant: "h2", children: "Interview Dashboard" }), _jsxs("div", { className: "score", children: [atsScore?.score || 85, "/100"] }), _jsx(Text, { variant: "caption", color: "secondary", children: "AI Analysis" })] }), _jsxs(Card, { className: "stat-card", children: [_jsx(Text, { variant: "h3", children: "\uD83C\uDFAF Skill Match" }), _jsxs("div", { className: "score", children: [atsScore?.keywordMatches ?
                                                    Math.round((atsScore.keywordMatches.length / (atsScore.keywordMatches.length + atsScore.missingKeywords.length)) * 100)
                                                    : 92, "%"] }), _jsx(Text, { variant: "caption", color: "secondary", children: "Keywords Found" })] }), _jsxs(Card, { className: "stat-card", children: [_jsx(Text, { variant: "h2", children: "Upload Your Resume" }), _jsx("div", { className: "score", children: presentationTopics.length || 3 }), _jsx(Text, { variant: "caption", color: "secondary", children: "Presentations" })] }), _jsxs(Card, { className: "stat-card", children: [_jsx(Text, { variant: "h3", children: "\u2753 Questions" }), _jsx("div", { className: "score", children: interviewQuestions.length || 6 }), _jsx(Text, { variant: "caption", color: "secondary", children: "AI Generated" })] })] }), _jsxs("div", { className: "nav-tabs", children: [_jsx(Button, { variant: activeTab === 'interview' ? 'primary' : 'ghost', onClick: () => setActiveTab('interview'), children: "\uD83D\uDCAC Interview Q&A" }), _jsx(Button, { variant: activeTab === 'chat' ? 'primary' : 'ghost', onClick: () => setActiveTab('chat'), children: "\uD83E\uDD16 AI Interview Coach" }), _jsx(Button, { variant: activeTab === 'presentations' ? 'primary' : 'ghost', onClick: () => setActiveTab('presentations'), children: "\uD83D\uDCC8 Presentations" }), _jsx(Button, { variant: activeTab === 'skills' ? 'primary' : 'ghost', onClick: () => setActiveTab('skills'), children: "\uD83C\uDFAF Skills Analysis" }), _jsx(Button, { variant: activeTab === 'jokes' ? 'primary' : 'ghost', onClick: () => setActiveTab('jokes'), children: "\uD83D\uDE04 Dad Jokes" })] }), _jsxs("div", { className: "content-area", children: [activeTab === 'interview' && (_jsxs("div", { className: "content-section", children: [_jsx(Text, { variant: "h2", children: "AI-Generated Interview Questions" }), _jsx("div", { className: "question-list", children: interviewQuestions.map((question, index) => (_jsxs(Card, { className: "question-card", children: [_jsxs("div", { className: "question-header", children: [_jsx("span", { className: "question-number", children: index + 1 }), _jsx("span", { className: "question-type", children: question.type })] }), _jsx(Text, { variant: "h3", children: question.question }), question.suggestedAnswer && (_jsxs("div", { className: "answer", children: [_jsx(Text, { variant: "body", weight: "bold", color: "accent", children: "AI-Suggested Answer:" }), _jsx(Text, { variant: "body", color: "secondary", children: question.suggestedAnswer }), question.tips && question.tips.length > 0 && (_jsxs("div", { className: "tips", children: [_jsx(Text, { variant: "body", weight: "bold", color: "accent", children: "\uD83D\uDCA1 Pro Tips:" }), _jsx("ul", { children: question.tips?.map((tip, i) => (_jsx("li", { children: _jsx(Text, { variant: "small", color: "secondary", children: tip }) }, i))) })] }))] }))] }, question.id))) })] })), activeTab === 'chat' && (_jsx("div", { className: "content-section", children: _jsx(InterviewChat, {}) })), activeTab === 'presentations' && (_jsxs("div", { className: "content-section", children: [_jsx(Text, { variant: "h2", children: "AI-Generated Presentation Topics" }), _jsx("div", { className: "presentation-list", children: presentationTopics.map((topic, index) => (_jsxs(Card, { className: "presentation-card", children: [_jsxs("div", { className: "presentation-header", children: [_jsx("span", { className: "presentation-number", children: index + 1 }), _jsxs("span", { className: "relevance", children: [topic.relevance, "% Relevant"] })] }), _jsx(Text, { variant: "h3", children: topic.title }), _jsx("ul", { children: topic.bullets.map((bullet, i) => (_jsx("li", { children: bullet }, i))) })] }, topic.id))) })] })), activeTab === 'skills' && (_jsxs("div", { className: "content-section", children: [_jsx(Text, { variant: "h2", children: "AI Skills Analysis" }), _jsxs("div", { className: "skills-analysis", children: [_jsxs(Card, { className: "skills-category", children: [_jsx(Text, { variant: "h3", color: "accent", children: "\u2705 Strengths" }), _jsx("ul", { children: atsScore?.strengths.map((strength, i) => (_jsx("li", { children: strength }, i))) || ['Strong technical skills match', 'Relevant experience'] })] }), _jsxs(Card, { className: "skills-category", children: [_jsx(Text, { variant: "h3", color: "accent", children: "\uD83C\uDFAF Improvements" }), _jsx("ul", { children: atsScore?.improvements.map((improvement, i) => (_jsx("li", { children: improvement }, i))) || ['Add quantifiable achievements', 'Include industry keywords'] })] }), _jsxs(Card, { className: "skills-category", children: [_jsx(Text, { variant: "h3", color: "accent", children: "\uD83D\uDD11 Keyword Matches" }), _jsx("div", { className: "keywords-grid", children: atsScore?.keywordMatches.map((keyword, i) => (_jsx("span", { className: "keyword matched", children: keyword }, i))) || ['React', 'Node.js', 'JavaScript'].map((keyword, i) => (_jsx("span", { className: "keyword matched", children: keyword }, i))) })] }), _jsxs(Card, { className: "skills-category", children: [_jsx(Text, { variant: "h3", color: "accent", children: "\u26A0\uFE0F Missing Keywords" }), _jsx("div", { className: "keywords-grid", children: atsScore?.missingKeywords.map((keyword, i) => (_jsx("span", { className: "keyword missing", children: keyword }, i))) || ['Docker', 'GraphQL', 'Kubernetes'].map((keyword, i) => (_jsx("span", { className: "keyword missing", children: keyword }, i))) })] })] })] })), activeTab === 'jokes' && (_jsxs("div", { className: "content-section", children: [_jsx(Text, { variant: "h2", children: "Take a Laugh Break" }), _jsx(Text, { variant: "body", color: "secondary", className: "jokes-subtitle mb-2", children: "Reduce interview stress with some dad jokes! Studies show laughter helps with confidence." }), _jsx(DadJoke, {})] }))] })] }) }), _jsx(Footer, {})] }));
};
export default App;
