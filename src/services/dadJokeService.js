export class DadJokeService {
    static getUsedIds() {
        try {
            const stored = sessionStorage.getItem(this.STORAGE_KEY);
            return new Set(stored ? JSON.parse(stored) : []);
        }
        catch {
            return new Set();
        }
    }
    static saveUsedIds(usedIds) {
        try {
            sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify([...usedIds]));
        }
        catch (error) {
            console.warn('Failed to save used joke IDs:', error);
        }
    }
    static getCachedJokes() {
        try {
            const cached = sessionStorage.getItem(this.CACHE_KEY);
            const expiry = sessionStorage.getItem(this.CACHE_EXPIRY);
            if (!cached || !expiry)
                return [];
            const expiryTime = parseInt(expiry, 10);
            if (Date.now() > expiryTime) {
                this.clearCache();
                return [];
            }
            return JSON.parse(cached);
        }
        catch {
            return [];
        }
    }
    static setCachedJokes(jokes) {
        try {
            const expiry = Date.now() + this.CACHE_DURATION;
            sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(jokes));
            sessionStorage.setItem(this.CACHE_EXPIRY, expiry.toString());
        }
        catch (error) {
            console.warn('Failed to cache jokes:', error);
        }
    }
    static clearCache() {
        try {
            sessionStorage.removeItem(this.CACHE_KEY);
            sessionStorage.removeItem(this.CACHE_EXPIRY);
        }
        catch (error) {
            console.warn('Failed to clear joke cache:', error);
        }
    }
    static async fetchJoke() {
        const response = await fetch(this.API_URL, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Interview Prep App (https://github.com/user/repo)'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch joke: ${response.status}`);
        }
        return await response.json();
    }
    static async prefetchJokes() {
        const jokes = [];
        const usedIds = this.getUsedIds();
        for (let i = 0; i < this.PREFETCH_COUNT; i++) {
            try {
                const joke = await this.fetchJoke();
                // Only add if we haven't used this joke before
                if (!usedIds.has(joke.id)) {
                    jokes.push(joke);
                }
            }
            catch (error) {
                console.warn(`Failed to fetch joke ${i + 1}:`, error);
            }
            // Small delay to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return jokes;
    }
    static async getRandomJoke() {
        try {
            let cachedJokes = this.getCachedJokes();
            const usedIds = this.getUsedIds();
            // If cache is empty or all cached jokes are used, prefetch new ones
            const availableJokes = cachedJokes.filter(joke => !usedIds.has(joke.id));
            if (availableJokes.length === 0) {
                console.log('Prefetching new jokes...');
                const newJokes = await this.prefetchJokes();
                if (newJokes.length === 0) {
                    // If we can't get any new jokes, reset the cache
                    console.log('No new jokes available, resetting cache...');
                    this.resetJokeCache();
                    return {
                        joke: "Why don't scientists trust atoms? Because they make up everything! 🔬 (Cache has been reset - fresh jokes incoming!)",
                        isLastJoke: false,
                        message: "Joke cache has been reset! You'll see fresh jokes now."
                    };
                }
                this.setCachedJokes(newJokes);
                cachedJokes = newJokes;
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
        }
        catch (error) {
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
    static resetJokeCache() {
        try {
            sessionStorage.removeItem(this.STORAGE_KEY);
            this.clearCache();
            console.log('Dad joke cache has been reset');
        }
        catch (error) {
            console.warn('Failed to reset joke cache:', error);
        }
    }
    static getJokeStats() {
        const usedIds = this.getUsedIds();
        const cachedJokes = this.getCachedJokes();
        const expiry = sessionStorage.getItem(this.CACHE_EXPIRY);
        return {
            used: usedIds.size,
            cached: cachedJokes.length,
            cacheExpiry: expiry ? new Date(parseInt(expiry, 10)).toLocaleString() : null
        };
    }
}
Object.defineProperty(DadJokeService, "STORAGE_KEY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'dadJoke_usedIds'
});
Object.defineProperty(DadJokeService, "CACHE_KEY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'dadJoke_cache'
});
Object.defineProperty(DadJokeService, "CACHE_EXPIRY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'dadJoke_cacheExpiry'
});
Object.defineProperty(DadJokeService, "API_URL", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'https://icanhazdadjoke.com'
});
Object.defineProperty(DadJokeService, "CACHE_DURATION", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 24 * 60 * 60 * 1000
}); // 24 hours
Object.defineProperty(DadJokeService, "PREFETCH_COUNT", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 10
});
