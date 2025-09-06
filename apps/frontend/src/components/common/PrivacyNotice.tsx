import React from 'react';
import './PrivacyNotice.css';

interface PrivacyNoticeProps {
  isVisible: boolean;
  fileType: 'resume' | 'job';
  onAccept: () => void;
  onDecline: () => void;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({
  isVisible,
  fileType,
  onAccept,
  onDecline
}) => {
  if (!isVisible) return null;

  return (
    <div className="privacy-notice-overlay">
      <div className="privacy-notice-modal">
        <div className="privacy-notice-header">
          <h2>Privacy Notice</h2>
        </div>
        
        <div className="privacy-notice-content">
          <p>
            <strong>Before uploading your {fileType === 'resume' ? 'resume' : 'job description'}, please review our data handling practices:</strong>
          </p>
          
          <h3>📁 File Processing</h3>
          <ul>
            <li>Your {fileType === 'resume' ? 'resume' : 'job description'} will be processed locally and sent to our AI service for analysis</li>
            <li>Files are temporarily cached for faster processing during your session</li>
            <li>Personal identifiable information (PII) is automatically detected and scrubbed</li>
            <li>Original files are not permanently stored on our servers</li>
          </ul>
          
          <h3>🔒 Data Security</h3>
          <ul>
            <li>All data transmission uses industry-standard encryption (HTTPS/TLS)</li>
            <li>Processing happens in secure, isolated environments</li>
            <li>No data is shared with third parties for marketing purposes</li>
            <li>Session data is cleared when you close the browser</li>
          </ul>
          
          <h3>🎯 Purpose & Usage</h3>
          <ul>
            <li>Data is used solely for generating personalized interview preparation content</li>
            <li>Analysis includes ATS scoring, interview questions, and skill matching</li>
            <li>No human reviewers access your personal information</li>
            <li>You can request data deletion at any time</li>
          </ul>
          
          <p>
            <strong>By proceeding with the {fileType === 'resume' ? 'resume' : 'job description'} upload, you consent to the processing of your document as described above.</strong>
          </p>
        </div>
        
        <div className="privacy-notice-actions">
          <button 
            className="privacy-notice-btn privacy-notice-btn-decline"
            onClick={onDecline}
          >
            Cancel Upload
          </button>
          <button 
            className="privacy-notice-btn privacy-notice-btn-accept"
            onClick={onAccept}
          >
            Proceed with Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;