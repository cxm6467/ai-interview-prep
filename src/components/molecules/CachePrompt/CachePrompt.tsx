import React from 'react';
import { Button } from '../../atoms/Button/Button';
import { Card } from '../../atoms/Card/Card';
import { Text } from '../../atoms/Text/Text';
import styles from './CachePrompt.module.css';

export interface CachePromptProps {
  isVisible: boolean;
  cacheType: 'resume' | 'jobDescription' | 'both';
  resumeFileName?: string;
  jobDescriptionPreview?: string;
  onUseCache: () => void;
  onSkipCache: () => void;
  onClose: () => void;
}

/**
 * CachePrompt Component
 * 
 * A modal dialog that prompts users when cached content is available,
 * allowing them to choose whether to use cached data or proceed with new analysis.
 * 
 * Features:
 * - Shows what content is available in cache
 * - Clear action buttons for user choice
 * - Responsive modal design
 * - Accessible with proper ARIA attributes
 * 
 * @param props - The component props
 * @returns JSX element representing a cache prompt dialog
 */
export const CachePrompt: React.FC<CachePromptProps> = ({
  isVisible,
  cacheType,
  resumeFileName,
  jobDescriptionPreview,
  onUseCache,
  onSkipCache,
  onClose
}) => {
  if (!isVisible) {
    return null;
  }

  const getCacheDescription = () => {
    switch (cacheType) {
      case 'resume':
        return `We found a cached analysis for your resume${resumeFileName ? ` (${resumeFileName})` : ''}.`;
      case 'jobDescription':
        return `We found a cached analysis for the job description${jobDescriptionPreview ? `: "${jobDescriptionPreview}..."` : ''}.`;
      case 'both':
        return `We found cached analyses for both your resume${resumeFileName ? ` (${resumeFileName})` : ''} and the job description.`;
      default:
        return 'We found cached content that matches your inputs.';
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="cache-prompt-title">
      <div className={styles.modal}>
        <Card className={styles.content}>
          <div className={styles.header}>
            <Text as="h2" variant="h2">
              🗄️ Cached Content Available
            </Text>
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
          
          <div className={styles.body}>
            <Text variant="body" className={styles.description}>
              {getCacheDescription()}
            </Text>
            <Text variant="small" color="secondary" className={styles.subtext}>
              Using cached content will give you instant results, while skipping will perform a fresh analysis.
            </Text>
          </div>
          
          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={onUseCache}
              className={styles.primaryButton}
            >
              ⚡ Use Cached Content
            </Button>
            <Button
              variant="secondary"
              onClick={onSkipCache}
              className={styles.secondaryButton}
            >
              🔄 Analyze Fresh
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};