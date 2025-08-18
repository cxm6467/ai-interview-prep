import { useState, useEffect } from 'react';
import { Card } from '@atoms/Card';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import { FileUpload } from '@molecules/FileUpload';
import { DadJoke } from '@molecules/DadJoke';
import { SessionInspector } from '@molecules/SessionInspector/SessionInspector';
import { InterviewChat } from '@organisms/InterviewChat';
import { Footer } from '@organisms/Footer';
import { DocumentParser } from './services/documentParser';
import { AIAnalysisService } from './services/aiAnalysis';
import { useAppStore } from './store/appStore';
import './App.css';

function App() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobInput, setJobInput] = useState('');
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('interview');

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
    atsScore,
    interviewQuestions,
    presentationTopics
  } = useAppStore();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const handleResumeUpload = (files: File[]) => {
    if (files.length > 0) {
      setResumeFile(files[0]);
      setError('');
    }
  };

  const handleJobUpload = (files: File[]) => {
    if (files.length > 0) {
      setJobFile(files[0]);
      setJobInput('');
      setError('');
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
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during analysis. Check console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (currentStep === 'upload') {
    return (
      <div className="app">
        <header className="header">
          <div className="header-content">
            <Text variant="h1" className="logo">🚀 Interview Prep</Text>
            <Text variant="caption" color="secondary">AI-Powered Career Success</Text>
          </div>
          <Button variant="ghost" size="small" onClick={toggleTheme} icon={theme === 'dark' ? '🌙' : '☀️'}>
            {theme === 'dark' ? 'Dark' : 'Light'}
          </Button>
        </header>
        
        <main className="main">
          <div className="container">
            <Card variant="elevated" className="upload-card">
              <Text variant="h1" align="center" className="title">
                Let's Prepare You for Success
              </Text>
              <Text variant="body" color="secondary" align="center" className="subtitle">
                Upload your resume and job description for AI-powered personalized interview preparation
              </Text>
              
              <div className="upload-sections">
                <div className="section">
                  <FileUpload
                    label="📄 Your Resume"
                    description="Drop your resume or click to browse"
                    file={resumeFile}
                    onDrop={handleResumeUpload}
                  />
                </div>

                <div className="section">
                  <Text variant="h3" className="section-title">💼 Job Description</Text>
                  
                  <input
                    type="url"
                    placeholder="Paste job posting URL..."
                    value={jobInput}
                    onChange={(e) => {
                      setJobInput(e.target.value);
                      setJobFile(null);
                    }}
                    className="url-input"
                    disabled={!!jobFile}
                  />
                  
                  <Text variant="caption" color="secondary" align="center" className="divider">
                    OR
                  </Text>
                  
                  <FileUpload
                    description="Upload job description file"
                    file={jobFile}
                    onDrop={handleJobUpload}
                  />
                </div>
              </div>

              {error && (
                <Card variant="outlined" className="error-card">
                  <Text variant="body" className="error-text">⚠️ {error}</Text>
                  {error.includes('OpenAI') && (
                    <Text variant="small" color="secondary" className="error-help">
                      💡 Add your OpenAI API key to the .env file to use real AI analysis.
                    </Text>
                  )}
                </Card>
              )}

              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handleAnalyze}
                disabled={!resumeFile || (!jobInput && !jobFile) || isAnalyzing}
                icon={isAnalyzing ? '⏳' : '🤖'}
              >
                {isAnalyzing ? 'Analyzing with AI...' : 'Generate AI Interview Prep'}
              </Button>

              <Card className="features-card">
                <Text variant="h3" color="accent">What you'll get:</Text>
                <ul className="features">
                  <li>✅ Real AI-generated personalized interview questions</li>
                  <li>🤖 Interactive AI interview coach with GPT-powered responses</li>
                  <li>📊 Smart ATS score optimization with detailed analysis</li>
                  <li>🎯 Skills gap analysis with actionable improvements</li>
                  <li>💡 Custom presentation topics with comprehensive outlines</li>
                  <li>😄 Dad jokes to keep you relaxed and confident</li>
                </ul>
              </Card>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <Text variant="h1" className="logo">🚀 Interview Dashboard</Text>
          <Text variant="caption" color="secondary">AI-Powered Personalized Preparation</Text>
        </div>
        <div className="header-actions">
          <Button variant="ghost" size="small" onClick={() => setCurrentStep('upload')} icon="←">
            New Analysis
          </Button>
          <Button variant="ghost" size="small" onClick={toggleTheme} icon={theme === 'dark' ? '🌙' : '☀️'}>
            {theme === 'dark' ? 'Dark' : 'Light'}
          </Button>
        </div>
      </header>
      
      <main className="main">
        <div className="container">
          <div className="stats-grid">
            <Card className="stat-card">
              <Text variant="h3">📊 ATS Score</Text>
              <div className="score">{atsScore?.score || 85}/100</div>
              <Text variant="caption" color="secondary">AI Analysis</Text>
            </Card>
            <Card className="stat-card">
              <Text variant="h3">🎯 Skill Match</Text>
              <div className="score">
                {atsScore?.keywordMatches ? 
                  Math.round((atsScore.keywordMatches.length / (atsScore.keywordMatches.length + atsScore.missingKeywords.length)) * 100) 
                  : 92}%
              </div>
              <Text variant="caption" color="secondary">Keywords Found</Text>
            </Card>
            <Card className="stat-card">
              <Text variant="h3">💡 Topics Ready</Text>
              <div className="score">{presentationTopics.length || 3}</div>
              <Text variant="caption" color="secondary">Presentations</Text>
            </Card>
            <Card className="stat-card">
              <Text variant="h3">❓ Questions</Text>
              <div className="score">{interviewQuestions.length || 6}</div>
              <Text variant="caption" color="secondary">AI Generated</Text>
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
                <Text variant="h2">AI-Generated Interview Questions</Text>
                <div className="question-list">
                  {interviewQuestions.map((question, index) => (
                    <Card key={question.id} className="question-card">
                      <div className="question-header">
                        <span className="question-number">{index + 1}</span>
                        <span className="question-type">{question.type}</span>
                      </div>
                      <Text variant="h3">{question.question}</Text>
                      {question.suggestedAnswer && (
                        <div className="answer">
                          <Text variant="body" weight="bold" color="accent">AI-Suggested Answer:</Text>
                          <Text variant="body" color="secondary">{question.suggestedAnswer}</Text>
                          {question.tips && question.tips.length > 0 && (
                            <div className="tips">
                              <Text variant="body" weight="bold" color="accent">💡 Pro Tips:</Text>
                              <ul>
                                {question.tips?.map((tip: string, i: number) => (
                                  <li key={i}>
                                    <Text variant="small" color="secondary">{tip}</Text>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="content-section">
                <InterviewChat />
              </div>
            )}
            
            {activeTab === 'presentations' && (
              <div className="content-section">
                <Text variant="h2">AI-Generated Presentation Topics</Text>
                <div className="presentation-list">
                  {presentationTopics.map((topic, index) => (
                    <Card key={topic.id} className="presentation-card">
                      <div className="presentation-header">
                        <span className="presentation-number">{index + 1}</span>
                        <span className="relevance">{topic.relevance}% Relevant</span>
                      </div>
                      <Text variant="h3">{topic.title}</Text>
                      <ul>
                        {topic.bullets.map((bullet: string, i: number) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'skills' && (
              <div className="content-section">
                <Text variant="h2">AI Skills Analysis</Text>
                <div className="skills-analysis">
                  <Card className="skills-category">
                    <Text variant="h3" color="accent">✅ Strengths</Text>
                    <ul>
                      {atsScore?.strengths.map((strength: string, i: number) => (
                        <li key={i}>{strength}</li>
                      )) || ['Strong technical skills match', 'Relevant experience']}
                    </ul>
                  </Card>
                  
                  <Card className="skills-category">
                    <Text variant="h3" color="accent">🎯 Improvements</Text>
                    <ul>
                      {atsScore?.improvements.map((improvement: string, i: number) => (
                        <li key={i}>{improvement}</li>
                      )) || ['Add quantifiable achievements', 'Include industry keywords']}
                    </ul>
                  </Card>

                  <Card className="skills-category">
                    <Text variant="h3" color="accent">🔑 Keyword Matches</Text>
                    <div className="keywords-grid">
                      {atsScore?.keywordMatches.map((keyword: string, i: number) => (
                        <span key={i} className="keyword matched">{keyword}</span>
                      )) || ['React', 'Node.js', 'JavaScript'].map((keyword, i) => (
                        <span key={i} className="keyword matched">{keyword}</span>
                      ))}
                    </div>
                  </Card>

                  <Card className="skills-category">
                    <Text variant="h3" color="accent">⚠️ Missing Keywords</Text>
                    <div className="keywords-grid">
                      {atsScore?.missingKeywords.map((keyword: string, i: number) => (
                        <span key={i} className="keyword missing">{keyword}</span>
                      )) || ['Docker', 'GraphQL', 'Kubernetes'].map((keyword, i) => (
                        <span key={i} className="keyword missing">{keyword}</span>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'jokes' && (
              <div className="content-section">
                <Text variant="h2">Take a Laugh Break</Text>
                <Text variant="body" color="secondary" align="center" className="jokes-subtitle">
                  Reduce interview stress with some dad jokes! Studies show laughter helps with confidence.
                </Text>
                <DadJoke />
                <SessionInspector />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
