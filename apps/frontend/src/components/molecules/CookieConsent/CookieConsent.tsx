import React, { useState, useEffect } from 'react';
import { Button, Card, Text } from '@atoms';
import styles from './CookieConsent.module.css';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setIsVisible(false);
    // Cookie consent accepted
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    // Clear any existing cache data
    localStorage.removeItem('interview_prep_cache');
    localStorage.removeItem('dadJoke_usedIds');
    localStorage.removeItem('dadJoke_cache');
    localStorage.removeItem('dadJoke_cacheExpiry');
    setIsVisible(false);
    // Cookie consent declined - cleared stored data
  };

  const handleCustomize = () => {
    setShowDetails(!showDetails);
  };

  if (!isVisible) {return null;}

  return (
    <div className={styles.overlay}>
      <Card className={styles.container}>
        <div className={styles.content}>
          <Text variant="h3" className={styles.title}>
            🍪 We Use Cookies
          </Text>
          
          <Text variant="body" className={styles.description}>
            This app uses local storage to enhance your experience by caching your resume and job data, 
            saving dad jokes, and remembering your preferences.
          </Text>

          {showDetails && (
            <div className={styles.details}>
              <Text variant="h4" className={styles.detailsTitle}>What we store:</Text>
              <ul className={styles.detailsList}>
                <li>
                  <strong>Resume & Job Data:</strong> Cached locally to avoid re-processing the same files
                </li>
                <li>
                  <strong>Dad Jokes:</strong> Cached to avoid showing duplicate jokes during your session
                </li>
                <li>
                  <strong>App Preferences:</strong> Theme settings and interview configuration
                </li>
                <li>
                  <strong>No Personal Data:</strong> We don't track you or send data to third parties
                </li>
              </ul>
              <Text variant="small" color="secondary" className={styles.note}>
                💡 All data stays on your device and is never shared with external servers.
              </Text>
            </div>
          )}

          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={handleAccept}
              className={styles.acceptButton}
            >
              Accept All
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleDecline}
              className={styles.declineButton}
            >
              Decline
            </Button>
            
            <Button
              variant="tertiary"
              onClick={handleCustomize}
              className={styles.customizeButton}
            >
              {showDetails ? 'Hide Details' : 'Learn More'}
            </Button>
          </div>

          <Text variant="caption" color="tertiary" align="center" className={styles.footer}>
            You can change these preferences anytime in Settings
          </Text>
        </div>
      </Card>
    </div>
  );
};