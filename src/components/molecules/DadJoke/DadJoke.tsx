import React, { useState, useEffect } from 'react';
import { Button } from '../../atoms/Button/Button';
import { Card } from '../../atoms/Card/Card';
import { Text } from '../../atoms/Text/Text';
import { DadJokeService } from '../../../services/dadJokeService';
import styles from './DadJoke.module.css';

interface DadJokeProps {
  className?: string;
}

export const DadJoke: React.FC<DadJokeProps> = ({ className = '' }) => {
  const [joke, setJoke] = useState('Ready for a laugh? Click the button below!');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const retryDelay = 1000; // Start with 1 second delay

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
      setRetryCount(0); // Reset retry count on success
      
      if (result.message) {
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Error fetching joke:', error);
      
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

  const resetCache = () => {
    DadJokeService.resetJokeCache();
    setError(null);
    setMessage('Joke cache reset! You\'ll see fresh jokes now.');
    setJoke('Cache cleared! Click "Get A Joke" for fresh content.');
    setRetryCount(0);
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
        
        <Text variant="body" align="center" className="joke-text">
          {joke}
        </Text>
        
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
            {isLoading ? 'Loading...' : 'Get A Joke'}
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
