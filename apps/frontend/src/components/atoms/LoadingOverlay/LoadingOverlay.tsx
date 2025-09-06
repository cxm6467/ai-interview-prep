import React, { useState, useEffect, useMemo } from 'react';
import { Text } from '@atoms';
import { DadJokeService } from '@services';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  message?: string;
  showJokes?: boolean;
  cycleInterval?: number;
  showTimer?: boolean;
  onElapsedTimeChange?: (elapsedTime: number) => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Generating interview questions...',
  showJokes = true,
  cycleInterval = 5000, // 5 seconds
  showTimer = true,
  onElapsedTimeChange
}) => {
  const [currentJoke, setCurrentJoke] = useState<string>('Loading a joke...');
  const [, setJokeIndex] = useState(0);
  const [prefetchedJokes, setPrefetchedJokes] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  // Fallback jokes for immediate display
  const fallbackJokes = useMemo(() => [
    "Why don't scientists trust atoms? Because they make up everything! 🔬",
    "What do you call a fake noodle? An impasta! 🍝",
    "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
    "What do you call a bear with no teeth? A gummy bear! 🐻",
    "Why don't eggs tell jokes? They'd crack each other up! 🥚",
    "What do you call a sleeping bull? A bulldozer! 😴",
    "Why don't programmers like nature? It has too many bugs! 🐛",
    "What's the best thing about Switzerland? I don't know, but the flag is a big plus! 🇨🇭"
  ], []);

  // Prefetch jokes when component mounts
  useEffect(() => {
    const prefetchJokes = async () => {
      // Prefetching jokes for loading screen
      const jokes: string[] = [];
      
      // Try to get 5 fresh jokes
      for (let i = 0; i < 5; i++) {
        try {
          const result = await DadJokeService.getRandomJoke();
          jokes.push(result.joke);
          
          // Small delay to be respectful to the API
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch {
          break; // Stop trying if we hit an error
        }
      }
      
      if (jokes.length > 0) {
        // Prefetched jokes successfully
        setPrefetchedJokes(jokes);
        setCurrentJoke(jokes[0]);
      } else {
        // Using fallback jokes for loading screen
        setPrefetchedJokes(fallbackJokes);
        setCurrentJoke(fallbackJokes[0]);
      }
    };

    if (showJokes) {
      // Start with a fallback joke immediately
      setCurrentJoke(fallbackJokes[0]);
      prefetchJokes();
    }
  }, [showJokes, fallbackJokes]);

  // Cycle through jokes
  useEffect(() => {
    if (!showJokes) {return;}

    const interval = setInterval(() => {
      setJokeIndex((prevIndex) => {
        const jokesToUse = prefetchedJokes.length > 0 ? prefetchedJokes : fallbackJokes;
        const nextIndex = (prevIndex + 1) % jokesToUse.length;
        setCurrentJoke(jokesToUse[nextIndex]);
        return nextIndex;
      });
    }, cycleInterval);

    return () => clearInterval(interval);
  }, [showJokes, cycleInterval, prefetchedJokes, fallbackJokes]);

  // Timer effect to update elapsed time
  useEffect(() => {
    if (!showTimer) return;

    const timerInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000); // Convert to seconds
      setElapsedTime(elapsed);
      onElapsedTimeChange?.(elapsed);
    }, 1000); // Update every second

    return () => clearInterval(timerInterval);
  }, [showTimer, startTime, onElapsedTimeChange]);

  // Format elapsed time as MM:SS
  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
      <Text variant="h3" color="primary" className="mb-4">{message}</Text>
      {showTimer && (
        <div className="mb-4">
          <Text variant="body" color="secondary" align="center" className="mb-1">
            Processing time: {formatElapsedTime(elapsedTime)}
          </Text>
          {elapsedTime > 10 && (
            <Text variant="small" color="secondary" align="center">
              AI analysis typically takes 8-15 seconds
            </Text>
          )}
        </div>
      )}
      {showJokes && (
        <div className="max-w-md mx-auto">
          <Text variant="body" color="primary" align="center" className="mb-2">
            While you wait, enjoy a dad joke! 😄
          </Text>
          <Text variant="body" color="primary" align="center" className="italic">
            {currentJoke}
          </Text>
        </div>
      )}
    </div>
  );
};
