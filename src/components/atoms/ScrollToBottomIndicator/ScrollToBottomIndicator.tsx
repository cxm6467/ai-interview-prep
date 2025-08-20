import React from 'react';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import styles from './ScrollToBottomIndicator.module.css';

interface ScrollToBottomIndicatorProps {
  /** Number of unseen messages */
  unseenCount: number;
  /** Whether the indicator should be visible */
  isVisible: boolean;
  /** Function to call when clicking the scroll to bottom button */
  onScrollToBottom: () => void;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * ScrollToBottomIndicator Component
 * 
 * Displays a floating indicator when there are unseen messages in a chat.
 * Shows the count of unseen messages and allows users to quickly scroll
 * to the bottom to see the latest content.
 * 
 * @component
 * @param {ScrollToBottomIndicatorProps} props - Component props
 * @returns {JSX.Element} Rendered ScrollToBottomIndicator component
 */
export const ScrollToBottomIndicator: React.FC<ScrollToBottomIndicatorProps> = ({
  unseenCount,
  isVisible,
  onScrollToBottom,
  className = ''
}) => {
  if (!isVisible || unseenCount === 0) {
    return null;
  }

  const handleClick = () => {
    onScrollToBottom();
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <Button
        variant="primary"
        size="medium"
        onClick={handleClick}
        className={styles.button}
        aria-label={`Scroll to bottom - ${unseenCount} new message${unseenCount === 1 ? '' : 's'}`}
      >
        <div className={styles.content}>
          <div className={styles.iconAndText}>
            <span className={styles.icon}>↓</span>
            <Text variant="body" className={styles.text}>
              {unseenCount === 1 ? '1 new message' : `${unseenCount} new messages`}
            </Text>
          </div>
          <div className={styles.badge}>
            <Text variant="small" className={styles.badgeText}>
              {unseenCount}
            </Text>
          </div>
        </div>
      </Button>
    </div>
  );
};