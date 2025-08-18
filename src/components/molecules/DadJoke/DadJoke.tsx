import React, { useState } from 'react';
import { Card } from '@atoms/Card';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import { DadJokeService } from '@services/dadJokeService';
import styles from './DadJoke.module.css';

export const DadJoke: React.FC = () => {
  const [joke, setJoke] = useState<string>('Click the button to get a dad joke! 😄');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const fetchJoke = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const result = await DadJokeService.getRandomJoke();
      setJoke(result.joke);
      
      if (result.message) {
        setMessage(result.message);
      }
    } catch (_) {
      setJoke('Why don\'t scientists trust atoms? Because they make up everything! 🔬 (Offline mode)');
      setMessage('Unable to fetch new jokes - using cached content');
    } finally {
      setIsLoading(false);
    }
  };

  const resetCache = () => {
    DadJokeService.resetJokeCache();
    setMessage('Joke cache reset! You\'ll see fresh jokes now.');
    setJoke('Cache cleared! Click "Get Another Joke" for fresh content.');
  };

  return (
    <Card variant="elevated" className={styles.container}>
      <div className={styles.jokeDisplay}>
        <span className={styles.jokeIcon}>😄</span>
        <Text variant="body" align="center" className={styles.jokeText}>
          {joke}
        </Text>
      </div>
      
      {message && (
        <Card variant="outlined" className={styles.messageCard}>
          <Text variant="caption" color="secondary" align="center">
            💡 {message}
          </Text>
        </Card>
      )}
      
      <div className={styles.buttons}>
        <Button 
          variant="primary" 
          onClick={fetchJoke} 
          disabled={isLoading}
          icon={isLoading ? '⏳' : '🎭'}
          fullWidth
        >
          {isLoading ? 'Getting Joke...' : 'Get Another Joke'}
        </Button>
        
        <Button 
          variant="ghost" 
          size="small" 
          onClick={resetCache}
          icon="🔄"
        >
          Reset Cache
        </Button>
      </div>
      
      <div className={styles.stats}>
        <Text variant="caption" color="tertiary" align="center">
          Dad jokes help reduce interview stress! Studies show laughter improves confidence and memory recall.
        </Text>
      </div>
    </Card>
  );
};
