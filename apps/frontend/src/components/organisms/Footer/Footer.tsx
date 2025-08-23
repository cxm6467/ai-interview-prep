import React from 'react';
import { Text } from '@atoms/Text';
import { Card } from '@atoms/Card';
import { FiGithub, FiLinkedin, FiExternalLink } from 'react-icons/fi';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <Card className={styles.footerContent}>
        <div className={styles.section}>
          <Text variant="h3" color="accent">🚀 Dynamic Interview Prep</Text>
          <Text variant="small" color="secondary">
            AI-powered interview preparation with personalized questions, 
            real-time feedback, and comprehensive skills analysis.
          </Text>
        </div>
        
        <div className={styles.section}>
          <Text variant="h3" color="accent">✨ Features</Text>
          <ul className={styles.featureList}>
            <li>📄 Smart resume & job description parsing</li>
            <li>🤖 AI-generated personalized questions</li>
            <li>💬 Interactive interview coaching</li>
            <li>📊 ATS score optimization</li>
            <li>🎯 Skills gap analysis</li>
            <li>📈 Custom presentation topics</li>
          </ul>
        </div>
        
        <div className={styles.section}>
          <Text variant="h3" color="accent">💻 Built With</Text>
          <div className={styles.techStack}>
            <span className={styles.tech}>React</span>
            <span className={styles.tech}>TypeScript</span>
            <span className={styles.tech}>Vite</span>
            <span className={styles.tech}>Zustand</span>
            <span className={styles.tech}>Atomic Design</span>
            <span className={styles.tech}>Mobile-First</span>
          </div>
        </div>
        
        <div className={styles.section}>
          <Text variant="h3" color="accent">🔗 Connect</Text>
          <div className={styles.socialLinks}>
            <a 
              href="https://www.linkedin.com/in/chris-marasco-4-/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <FiLinkedin className={styles.socialIcon} />
              <span>LinkedIn</span>
              <FiExternalLink className={styles.externalIcon} />
            </a>
            <a 
              href="https://github.com/cxm6467" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <FiGithub className={styles.socialIcon} />
              <span>My GitHub</span>
              <FiExternalLink className={styles.externalIcon} />
            </a>
            <a 
              href="https://github.com/cxm6467/ai-interview-prep" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <FiGithub className={styles.socialIcon} />
              <span>This Project</span>
              <FiExternalLink className={styles.externalIcon} />
            </a>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <Text variant="caption" color="tertiary" align="center">
            Built with 💜 using Atomic Design principles and Mobile-First development
          </Text>
          <Text variant="caption" color="tertiary" align="center">
            © {new Date().getFullYear()} Dynamic Interview Prep. Open source project for educational purposes.
          </Text>
        </div>
      </Card>
    </footer>
  );
};
