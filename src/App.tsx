import React, { useState, useEffect, SetStateAction } from 'react';
import { Card } from '@atoms/Card';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import { FileUpload } from '@molecules/FileUpload';
import { DadJoke } from '@molecules/DadJoke';
import { InterviewChat } from '@organisms/InterviewChat';
import { Footer } from '@organisms/Footer';
import { DocumentParser } from '@/services/documentParser';
import { AIAnalysisService } from '@/services/aiAnalysis';
import { useAppStore } from '@/store/appStore';
import { FiSun, FiMoon, FiUpload, FiFileText, FiAward, FiMessageSquare, FiChevronRight } from 'react-icons/fi';
import './App.css';
const App = () => {
    // State management
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jobInput, setJobInput] = useState('');
    const [jobFile, setJobFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('interview');
    const { currentStep, theme, toggleTheme, setCurrentStep, setResumeData, setJobDescription, setInterviewQuestions, setPresentationTopics, setATSScore, atsScore, interviewQuestions, presentationTopics } = useAppStore();
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);
    const handleResumeUpload = (files: File[]) => {
        if (files.length > 0) {
            setResumeFile(files[0]);
            setError('');
        }
    };

    const handleJobFileUpload = (files: File[]) => {
        if (files.length > 0) {
            setJobFile(files[0]);
            setJobInput('');
        }
    };
    const handleAnalyze = async () => {
        if (!resumeFile) {
            setError('Please upload your resume');
            return;
        }
        if (!jobInput && !jobFile) {
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
                : jobInput;
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
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis. Check console for details.';
            setError(errorMessage);
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    // Render Upload View
    if (currentStep === 'upload') {
      return (
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
              label="Drag & drop your resume here"
              description="Supports PDF, DOC, DOCX (Max 5MB)"
            />
            {resumeFile && (
              <div className="file-preview">
                <FiFileText className="file-icon" />
                <span>{resumeFile?.name}</span>
              </div>
            )}
          </Card>

          <Card className="upload-section">
            <Text as="h2" variant="h2" className="section-header">
              <FiFileText className="icon" /> Job Description
            </Text>
            <div className="job-input-container">
              <textarea
                className="job-textarea"
                placeholder="Paste url or job description here..."
                value={jobInput}
                onChange={(e) => setJobInput(e.target.value)}
                rows={6}
              />
            </div>
          </Card>
        </div>

        <div className="action-container">
          <Button
            variant="primary"
            size="large"
            onClick={handleAnalyze}
            disabled={!resumeFile || (!jobInput && !jobFile) || isAnalyzing}
            className="analyze-button"
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            <FiChevronRight className="button-icon" />
          </Button>
        </div>

        <div className="features-grid">
          <Card className="feature-card">
            <div className="feature-icon">
              <FiMessageSquare />
            </div>
            <Text as="h3" variant="h3">AI-Powered Questions</Text>
            <Text variant="body" color="secondary">
              Get personalized interview questions based on your resume and job description.
            </Text>
          </Card>

          <Card className="feature-card">
            <div className="feature-icon">
              <FiAward />
            </div>
            <Text as="h3" variant="h3">ATS Score</Text>
            <Text variant="body" color="secondary">
              See how well your resume matches the job requirements with our ATS scoring system.
            </Text>
          </Card>
        </div>

        <div className="text-center">
          <DadJoke />
        </div>
      </main>
      <Footer />
    </div>
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
                variant="secondary"
                size="medium"
                onClick={() => setCurrentStep('upload')}
                className="new-analysis-btn"
              >
                <FiUpload className="button-icon" />
                New Analysis
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
                  <Text variant="h2">Interview Prep</Text>
                  <div className="interview-questions">
                    {interviewQuestions?.map((question) => (
                      <Card key={question.id} className="question-card">
                        <Text variant="body">{question.question}</Text>
                        {question.suggestedAnswer && (
                          <div className="suggested-answer">
                            <Text variant="small" color="secondary">Suggested Answer:</Text>
                            <Text variant="body">{question.suggestedAnswer}</Text>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'skills' && (
                <div className="content-section">
                  <Text variant="h2" className="mb-6">AI Skills Analysis</Text>
                  <div className="skills-analysis grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <Text variant="h3" color="accent" className="mb-4">
                        ✅ Strengths
                      </Text>
                      <ul className="space-y-2">
                        {atsScore?.strengths?.map((strength, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2">•</span>
                            <Text variant="body">{strength}</Text>
                          </li>
                        )) || (
                          <>
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <Text variant="body">Strong technical skills match</Text>
                            </li>
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <Text variant="body">Relevant experience</Text>
                            </li>
                          </>
                        )}
                      </ul>
                    </Card>
                    <Card className="p-6">
                      <Text variant="h3" color="accent" className="mb-4">
                        🎯 Improvements
                      </Text>
                      <ul className="space-y-2">
                        {atsScore?.improvements?.map((improvement, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2">•</span>
                            <Text variant="body">{improvement}</Text>
                          </li>
                        )) || (
                          <>
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <Text variant="body">Add quantifiable achievements</Text>
                            </li>
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <Text variant="body">Include industry keywords</Text>
                            </li>
                          </>
                        )}
                      </ul>
                    </Card>
                    <Card className="p-6">
                      <Text variant="h3" color="accent" className="mb-4">
                        🔑 Keyword Matches
                      </Text>
                      <div className="flex flex-wrap gap-2">
                        {atsScore?.keywordMatches?.map((keyword, i) => (
                          <span key={i} className="keyword-match">
                            {keyword}
                          </span>
                        )) || (
                          <>
                            <span className="keyword-match">React</span>
                            <span className="keyword-match">Node.js</span>
                            <span className="keyword-match">JavaScript</span>
                          </>
                        )}
                      </div>
                    </Card>
                    <Card className="p-6">
                      <Text variant="h3" color="accent" className="mb-4">
                        ⚠️ Missing Keywords
                      </Text>
                      <div className="flex flex-wrap gap-2">
                        {atsScore?.missingKeywords?.map((keyword, i) => (
                          <span key={i} className="keyword-missing">
                            {keyword}
                          </span>
                        )) || (
                          <>
                            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">Docker</span>
                            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">GraphQL</span>
                            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">Kubernetes</span>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              )}
              {activeTab === 'chat' && (
                <div className="content-section">
                  <Text variant="h2">AI Interview Coach</Text>
                  <Text variant="body" color="secondary" className="mb-4">
                    Practice your interview skills with our AI coach. Get instant feedback on your answers!
                  </Text>
                  <InterviewChat />
                </div>
              )}
              {activeTab === 'presentations' && (
                <div className="content-section">
                  <Text variant="h2" className="mb-2">Presentation Topics</Text>
                  <Text variant="body" color="secondary" className="mb-6">
                    Here are some presentation topics based on your resume and the job description.
                  </Text>
                  <div className="space-y-6">
                    {presentationTopics?.length > 0 ? (
                      presentationTopics.map((topic) => (
                        <Card key={topic.id} className="p-6 hover:shadow-md transition-shadow">
                          <Text variant="h3" className="text-xl font-semibold mb-4">{topic.title}</Text>
                          <ul className="space-y-2">
                            {topic.bullets.map((bullet, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2 text-blue-500">•</span>
                                <Text variant="body">{bullet}</Text>
                              </li>
                            ))}
                          </ul>
                        </Card>
                      ))
                    ) : (
                      <Card className="p-6 text-center">
                        <Text variant="body" color="secondary">
                          No presentation topics generated yet. Please analyze a job description first.
                        </Text>
                      </Card>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'jokes' && (
                <div className="content-section">
                  <Text variant="h2">Take a Laugh Break</Text>
                  <Text variant="body" color="secondary" className="jokes-subtitle mb-2">
                    Reduce interview stress with some dad jokes! Studies show laughter helps with confidence.
                  </Text>
                  <DadJoke />
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
};
export default App;
