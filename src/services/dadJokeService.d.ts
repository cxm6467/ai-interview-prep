export declare class DadJokeService {
    private static readonly STORAGE_KEY;
    private static readonly CACHE_KEY;
    private static readonly CACHE_EXPIRY;
    private static readonly API_URL;
    private static readonly CACHE_DURATION;
    private static readonly PREFETCH_COUNT;
    private static getUsedIds;
    private static saveUsedIds;
    private static getCachedJokes;
    private static setCachedJokes;
    private static clearCache;
    private static fetchJoke;
    private static prefetchJokes;
    static getRandomJoke(): Promise<{
        joke: string;
        isLastJoke: boolean;
        message?: string;
    }>;
    static resetJokeCache(): void;
    static getJokeStats(): {
        used: number;
        cached: number;
        cacheExpiry: string | null;
    };
}
