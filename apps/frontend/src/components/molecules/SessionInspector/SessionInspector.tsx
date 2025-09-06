import React, { useState, useEffect } from 'react';
import { Card } from '@atoms/Card';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import { DadJokeService } from '@services/dadJokeService';
import styles from './SessionInspector.module.css';

interface JokeStats {
  used: number;
  cached: number;
  cacheExpiry: string | null;
}

interface StorageData {
  usedIds: string[];
  cache: Array<{ id: string; joke: string }>;
  expiry: string | null;
  totalStorage: string;
}

export const SessionInspector: React.FC = () => {
  const [stats, setStats] = useState<JokeStats | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [storageData, setStorageData] = useState<StorageData>({
    usedIds: [],
    cache: [],
    expiry: null,
    totalStorage: '{}'
  });

  const refreshData = () => {
    const jokeStats = DadJokeService.getJokeStats();
    setStats(jokeStats);

    // Get all session storage data related to jokes
    const usedIds = sessionStorage.getItem('dadJoke_usedIds');
    const cache = sessionStorage.getItem('dadJoke_cache');
    const expiry = sessionStorage.getItem('dadJoke_cacheExpiry');

    setStorageData({
      usedIds: usedIds ? JSON.parse(usedIds) : [],
      cache: cache ? JSON.parse(cache) : [],
      expiry: expiry ? new Date(parseInt(expiry)).toLocaleString() : null,
      totalStorage: JSON.stringify({
        usedIds: usedIds ? JSON.parse(usedIds) : [],
        cache: cache ? JSON.parse(cache) : []
      }, null, 2)
    });
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 1000);
    return () => clearInterval(interval);
  }, []);

  const clearAllData = () => {
    DadJokeService.resetJokeCache();
    refreshData();
  };

  return (
    <Card variant="outlined" className={styles.inspector}>
      <div className={styles.header}>
        <Text variant="h3" color="accent">🔍 Session Inspector</Text>
        <div className={styles.controls}>
          <Button 
            variant="ghost" 
            size="small" 
            onClick={() => setIsExpanded(!isExpanded)}
            icon={isExpanded ? '🔼' : '🔽'}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button 
            variant="ghost" 
            size="small" 
            onClick={refreshData}
            icon="🔄"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <Text variant="small" color="secondary">Used Jokes:</Text>
          <Text variant="body" weight="bold">{stats?.used || 0}</Text>
        </div>
        <div className={styles.statItem}>
          <Text variant="small" color="secondary">Cached Jokes:</Text>
          <Text variant="body" weight="bold">{stats?.cached || 0}</Text>
        </div>
        <div className={styles.statItem}>
          <Text variant="small" color="secondary">Cache Expires:</Text>
          <Text variant="small">{stats?.cacheExpiry || 'Not set'}</Text>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.section}>
            <Text variant="h3" color="accent">Used Joke IDs</Text>
            <div className={styles.dataContainer}>
              <Text variant="small" color="secondary">
                {storageData.usedIds.length > 0 
                  ? storageData.usedIds.join(', ')
                  : 'No jokes used yet'
                }
              </Text>
            </div>
          </div>

          <div className={styles.section}>
            <Text variant="h3" color="accent">Cached Jokes</Text>
            <div className={styles.dataContainer}>
              {storageData.cache.length > 0 ? (
                storageData.cache.map((joke: { id: string; joke: string }, index: number) => (
                  <div key={joke.id} className={styles.jokeItem}>
                    <Text variant="small" weight="bold">#{index + 1} (ID: {joke.id})</Text>
                    <Text variant="small" color="secondary">{joke.joke}</Text>
                  </div>
                ))
              ) : (
                <Text variant="small" color="secondary">No jokes cached</Text>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <Text variant="h3" color="accent">Raw Session Storage</Text>
            <pre className={styles.rawData}>
              <Text variant="small">{storageData.totalStorage}</Text>
            </pre>
          </div>

          <div className={styles.actions}>
            <Button 
              variant="secondary" 
              onClick={clearAllData}
              icon="🗑️"
            >
              Clear All Data
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
