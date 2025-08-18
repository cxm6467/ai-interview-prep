import React, { useState, useEffect } from 'react';
import './InterviewPrepPro.css';

const InterviewPrepPro: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeSection, setActiveSection] = useState('interview');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="interview-prep-app">
      <header>
        <div className="container">
          <div className="header-container">
            <div className="header-left">
              <h1>🚀 Interview Prep</h1>
              <span className="subtitle">Full Stack Engineer Edition</span>
            </div>
            <button className="theme-toggle" onClick={toggleTheme}>
              <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
              <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="container">
        <div className="nav-tabs">
          <button 
            className={`tab-button ${activeSection === 'interview' ? 'active' : ''}`}
            onClick={() => setActiveSection('interview')}
          >
            💬 Interview Q&A
          </button>
          <button 
            className={`tab-button ${activeSection === 'presentations' ? 'active' : ''}`}
            onClick={() => setActiveSection('presentations')}
          >
            📈 Presentations
          </button>
          <button 
            className={`tab-button ${activeSection === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveSection('skills')}
          >
            🎯 Skills Match
          </button>
        </div>

        <div className="content">
          {activeSection === 'interview' && (
            <div className="section">
              <h2>Technical Interview Questions</h2>
              <div className="card">
                <div className="question">
                  <span className="question-number">1</span>
                  <span>Describe your experience with Node.js and React in production environments.</span>
                </div>
                <div className="answer">
                  At Quest Mindshare, I enhanced a full-stack application using React with hooks and context, 
                  focusing on creating reusable UI components. At Progress Residential, I worked extensively 
                  with Node.js on the backend, leading the back-end community of practice.
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'presentations' && (
            <div className="section">
              <h2>Presentation Topics</h2>
              <div className="card presentation-card">
                <div className="presentation-title">
                  <span className="presentation-number">1</span>
                  Modernizing Federal Systems
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'skills' && (
            <div className="section">
              <h2>Skills Match Analysis</h2>
              <div className="info-section">
                <h3>✅ Perfect Matches with Requirements</h3>
                <div className="skills-grid">
                  <div className="skill-category">
                    <div className="skill-title">Core Technologies</div>
                    <div className="skill-item">✓ Node.js (Expert)</div>
                    <div className="skill-item">✓ React (Hooks, Context)</div>
                    <div className="skill-item">✓ TypeScript</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPrepPro;
