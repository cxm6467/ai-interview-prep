import React, { useState, useEffect } from 'react';
import { Button, Card, Text, SpeechButton } from '@atoms';
import { DadJokeService } from '@services';
import { useAppStore } from '@/store/appStore';

interface DadJokeProps {
  className?: string;
}

export const DadJoke: React.FC<DadJokeProps> = ({ className = '' }) => {
  const { currentDadJoke, setCurrentDadJoke } = useAppStore();
  const [joke, setJoke] = useState(currentDadJoke || 'Ready for a laugh? Click the button below!');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const retryDelay = 1000; // Start with 1 second delay

  // Sync local state with store
  useEffect(() => {
    if (currentDadJoke) {
      setJoke(currentDadJoke);
    }
  }, [currentDadJoke]);

  const fetchJoke = async (isRetry = false) => {
    if (isLoading) {return;}
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isRetry) {
        setJoke('Getting a fresh joke...');
      }
      
      const result = await DadJokeService.getRandomJoke();
      setJoke(result.joke);
      setCurrentDadJoke(result.joke); // Store in app state for DevPanel
      setRetryCount(0); // Reset retry count on success
      
      if (result.message) {
        setMessage(result.message);
      }
    } catch {
      
      if (retryCount < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = retryDelay * Math.pow(2, retryCount);
        setTimeout(() => {
          setRetryCount(c => c + 1);
          fetchJoke(true);
        }, delay);
        
        setJoke(`Having trouble connecting... (Retry ${retryCount + 1}/${maxRetries})`);
      } else {
        setError('Failed to load a joke. Please try again later.');
        setJoke('Oops! Something went wrong.');
      }
      setMessage('Unable to fetch new jokes - using cached content');
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleRetry = () => {
    setRetryCount(0);
    fetchJoke();
  };

  return (
    <div className="dad-joke-container">
      <Card className={`dad-joke-card max-w-[500px] mx-auto ${className} ${error ? 'error' : ''}`}>
        <div className={`joke-emoji ${isLoading ? 'pulse' : ''}`}>
          {error ? '😕' : isLoading ? '⏳' : '😄'}
        </div>
        
        <div className="joke-content">
          <Text variant="body" align="center" className="joke-text">
            {joke}
          </Text>
          {!isLoading && !error && joke !== 'Ready for a laugh? Click the button below!' && (
            <div className="joke-speech-container">
              <SpeechButton 
                text={joke} 
                size="small"
                variant="ghost"
                showLabel={false}
                className="joke-speech-button"
              />
            </div>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <Button 
              onClick={handleRetry}
              variant="primary"
              size="small"
              className="retry-button"
              icon="🔄"
            >
              Try Again
            </Button>
          </div>
        )}
        
        <div className="button-group">
          <Button 
            onClick={() => fetchJoke()} 
            variant="primary" 
            size="medium"
            disabled={isLoading}
            icon={isLoading ? '⏳' : '🎭'}
            className={`action-button ${isLoading ? 'loading' : ''}`}
            style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }}
          >
            {isLoading ? 'Loading...' : 'Get a Joke'}
          </Button>
          
          {message && !error && (
            <div className="message">
              💡 {message}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DadJoke;
