import { APIMonitor } from './progressService';

interface DadJoke {
  id: string;
  joke: string;
  status: number;
}

interface JokeSearchResponse {
  current_page: number;
  limit: number;
  next_page: number;
  previous_page: number;
  results: DadJoke[];
  search_term: string;
  status: number;
  total_jokes: number;
  total_pages: number;
}

/**
 * Dad Joke Service with persistent localStorage caching
 * 
 * Features:
 * - Persistent caching across browser sessions (localStorage)
 * - Smart uniqueness tracking to prevent repeat jokes
 * - Batch API fetching (up to 60 jokes in 2 calls)
 * - 7-day cache expiration with automatic cleanup
 * - Proactive prefetching when cache runs low
 */
export class DadJokeService {
  private static readonly STORAGE_KEY = 'dadJoke_usedIds';
  private static readonly CACHE_KEY = 'dadJoke_cache';
  private static readonly CACHE_EXPIRY = 'dadJoke_cacheExpiry';
  private static readonly SEARCH_URL = 'https://icanhazdadjoke.com/search';
  private static readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days for localStorage
  private static readonly JOKES_PER_BATCH = 30; // Max allowed by API

  private static getUsedIds(): Set<string> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  }

  private static saveUsedIds(usedIds: Set<string>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...usedIds]));
    } catch (error) {
      console.warn('Failed to save used joke IDs:', error);
    }
  }

  private static getCachedJokes(): DadJoke[] {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      const expiry = localStorage.getItem(this.CACHE_EXPIRY);
      
      if (!cached || !expiry) {return [];}
      
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() > expiryTime) {
        this.clearCache();
        return [];
      }
      
      return JSON.parse(cached);
    } catch {
      return [];
    }
  }

  private static setCachedJokes(jokes: DadJoke[]): void {
    try {
      const expiry = Date.now() + this.CACHE_DURATION;
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(jokes));
      localStorage.setItem(this.CACHE_EXPIRY, expiry.toString());
    } catch (error) {
      console.warn('Failed to cache jokes:', error);
    }
  }

  private static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.CACHE_EXPIRY);
    } catch (error) {
      console.warn('Failed to clear joke cache:', error);
    }
  }


  private static async fetchJokeBatch(page = 1): Promise<DadJoke[]> {
    const startTime = performance.now();
    const url = `${this.SEARCH_URL}?page=${page}&limit=${this.JOKES_PER_BATCH}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Interview Prep App (https://github.com/user/repo)'
        }
      });

      const duration = performance.now() - startTime;

      // Track API call for DevPanel monitoring (only in development)
      if (import.meta.env.DEV) {
        APIMonitor.addCall({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          method: 'GET',
          url: 'https://icanhazdadjoke.com/search',
          status: response.status,
          duration,
          timestamp: new Date(),
          cached: false, // External API calls aren't cached
          partial: false,
          components: [`page=${page}`, `limit=${this.JOKES_PER_BATCH}`]
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch joke batch: ${response.status}`);
      }

      const searchResponse: JokeSearchResponse = await response.json();
      
      // Update API monitoring with response body (only in development)
      if (import.meta.env.DEV) {
        const lastCall = APIMonitor.getCalls()[0];
        if (lastCall && lastCall.url === 'https://icanhazdadjoke.com/search') {
          lastCall.responseBody = searchResponse;
        }
      }
      
      return searchResponse.results;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Track failed API call
      APIMonitor.addCall({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        method: 'GET',
        url: 'https://icanhazdadjoke.com/search',
        status: error instanceof Error && error.message.includes('status') 
          ? parseInt(error.message.match(/status (\d+)/)?.[1] || '0') || 500
          : 0,
        duration,
        timestamp: new Date(),
        cached: false,
        partial: false,
        components: [`page=${page}`, `limit=${this.JOKES_PER_BATCH}`]
      });

      throw error;
    }
  }

  private static async prefetchJokes(): Promise<DadJoke[]> {
    try {
      const usedIds = this.getUsedIds();
      
      // Fetch first batch (30 jokes)
      const firstBatch = await this.fetchJokeBatch(1);
      let allJokes = firstBatch.filter(joke => !usedIds.has(joke.id));
      
      // If we need more jokes and there are more pages available, fetch second batch
      if (allJokes.length < 25) { // If we got fewer than 25 unused jokes, get more
        try {
          const secondBatch = await this.fetchJokeBatch(2);
          const unusedSecondBatch = secondBatch.filter(joke => !usedIds.has(joke.id));
          allJokes = [...allJokes, ...unusedSecondBatch];
        } catch (error) {
          console.warn('Failed to fetch second batch of jokes:', error);
          // Continue with first batch only
        }
      }
      
      return allJokes;
    } catch (error) {
      console.warn('Failed to prefetch jokes:', error);
      return [];
    }
  }

  static async getRandomJoke(): Promise<{ joke: string; isLastJoke: boolean; message?: string }> {
    try {
      let cachedJokes = this.getCachedJokes();
      const usedIds = this.getUsedIds();

      // If cache is empty or running low on unused jokes, prefetch new ones
      const availableJokes = cachedJokes.filter(joke => !usedIds.has(joke.id));
      
      if (availableJokes.length <= 5) { // Prefetch when only 5 or fewer jokes remain
        // Prefetching new jokes
        
        // Add a small delay before starting prefetch to improve UX
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const newJokes = await this.prefetchJokes();
        
        if (newJokes.length === 0) {
          // If we can't get any new jokes, reset the cache and use fallback
          // No new jokes available, using fallback
          this.resetJokeCache();
          
          const fallbackJokes = [
            "Why don't scientists trust atoms? Because they make up everything! 🔬",
            "What do you call a fake noodle? An impasta! 🍝",
            "Why did the scarecrow win an award? He was outstanding in his field! 🌾"
          ];
          
          const randomFallback = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
          
          return {
            joke: `${randomFallback} (Using cached joke - API temporarily unavailable)`,
            isLastJoke: false,
            message: "Using offline jokes - try again in a moment for fresh content"
          };
        }
        
        // Merge new jokes with existing cache (remove duplicates)
        const mergedJokes = [...cachedJokes];
        newJokes.forEach(newJoke => {
          if (!mergedJokes.some(existing => existing.id === newJoke.id)) {
            mergedJokes.push(newJoke);
          }
        });
        
        this.setCachedJokes(mergedJokes);
        cachedJokes = mergedJokes;
      }

      // Get a random unused joke
      const unusedJokes = cachedJokes.filter(joke => !usedIds.has(joke.id));
      
      if (unusedJokes.length === 0) {
        this.resetJokeCache();
        return {
          joke: "What do you call a fake noodle? An impasta! 🍝 (Starting fresh with new jokes!)",
          isLastJoke: false,
          message: "You've seen all available jokes! Cache reset for fresh content."
        };
      }

      const randomJoke = unusedJokes[Math.floor(Math.random() * unusedJokes.length)];
      
      // Mark this joke as used
      usedIds.add(randomJoke.id);
      this.saveUsedIds(usedIds);
      
      const isLastJoke = unusedJokes.length === 1;
      
      return {
        joke: randomJoke.joke,
        isLastJoke,
        message: isLastJoke ? "This is the last unique joke in cache. Next request will refresh!" : undefined
      };
      
    } catch (error) {
      console.error('Error getting dad joke:', error);
      
      // Fallback jokes if API fails
      const fallbackJokes = [
        "Why don't scientists trust atoms? Because they make up everything! 🔬",
        "What do you call a fake noodle? An impasta! 🍝",
        "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
        "What do you call a bear with no teeth? A gummy bear! 🐻",
        "Why don't eggs tell jokes? They'd crack each other up! 🥚"
      ];
      
      const randomFallback = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
      
      return {
        joke: `${randomFallback} (Offline joke - API unavailable)`,
        isLastJoke: false,
        message: "Using offline jokes - check your internet connection"
      };
    }
  }

  static resetJokeCache(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.clearCache();
      // Dad joke cache has been reset
    } catch (error) {
      console.warn('Failed to reset joke cache:', error);
    }
  }

  static getJokeStats(): { used: number; cached: number; cacheExpiry: string | null } {
    const usedIds = this.getUsedIds();
    const cachedJokes = this.getCachedJokes();
    const expiry = localStorage.getItem(this.CACHE_EXPIRY);
    
    return {
      used: usedIds.size,
      cached: cachedJokes.length,
      cacheExpiry: expiry ? new Date(parseInt(expiry, 10)).toLocaleString() : null
    };
  }

  /**
   * Preload jokes in the background on app initialization
   * This runs without blocking the UI and populates the cache for better UX
   */
  static async preloadJokes(): Promise<void> {
    try {
      const cachedJokes = this.getCachedJokes();
      
      // Only preload if cache is empty or has fewer than 10 jokes
      if (cachedJokes.length < 10) {
        // Preloading dad jokes in background
        
        // Run prefetch in background without blocking
        setTimeout(async () => {
          try {
            const newJokes = await this.prefetchJokes();
            if (newJokes.length > 0) {
              this.setCachedJokes(newJokes);
              // Preloaded jokes successfully
            }
          } catch (error) {
            console.warn('Background joke preloading failed:', error);
          }
        }, 1000); // Delay 1 second to not interfere with app initialization
      }
    } catch (error) {
      console.warn('Failed to start joke preloading:', error);
    }
  }
}
