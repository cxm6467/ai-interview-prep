/**
 * Progress tracking service for long-running analysis operations
 * 
 * This service provides functionality to monitor the progress of AI analysis
 * operations that may take significant time to complete.
 */

interface APICallInfo {
  id: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: Date;
  cached: boolean;
  partial: boolean;
  components?: string[];
  requestBody?: unknown;
  responseBody?: unknown;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
}

// API monitoring for development
class APIMonitor {
  private static calls: APICallInfo[] = [];
  private static listeners: ((calls: APICallInfo[]) => void)[] = [];

  static addCall(call: APICallInfo) {
    this.calls = [call, ...this.calls.slice(0, 9)]; // Keep last 10 calls
    this.listeners.forEach(listener => listener(this.calls));
  }

  static getCalls(): APICallInfo[] {
    return this.calls;
  }

  static clearCalls() {
    this.calls = [];
    this.listeners.forEach(listener => listener(this.calls));
  }

  static addListener(listener: (calls: APICallInfo[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// Export for DevPanel integration
export { APIMonitor, type APICallInfo };

export interface AnalysisProgress {
  analysisId: string;
  phase: string;
  progress: number;
  message: string;
  timestamp: string;
  estimatedTimeRemaining?: number;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export class ProgressService {
  private static baseUrl = import.meta.env.VITE_API_BASE_URL + '/';

  /**
   * Check the progress of an ongoing analysis
   * @param analysisId The unique identifier for the analysis
   * @returns Promise resolving to current progress status
   */
  static async checkProgress(analysisId: string): Promise<AnalysisProgress> {
    const response = await fetch(`${this.baseUrl}progress/${analysisId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout for progress checks
    });

    if (!response.ok) {
      throw new Error(`Progress check failed: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to check progress');
    }

    return result.data;
  }

  /**
   * Poll for progress updates until analysis completes
   * @param analysisId The unique identifier for the analysis
   * @param onProgress Callback function called with each progress update
   * @param pollInterval Polling interval in milliseconds (default: 2000)
   * @returns Promise resolving when analysis completes or fails
   */
  static async pollProgress(
    analysisId: string,
    onProgress: (progress: AnalysisProgress) => void,
    pollInterval: number = 2000
  ): Promise<AnalysisProgress> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const progress = await this.checkProgress(analysisId);
          onProgress(progress);

          if (progress.phase === 'completed') {
            resolve(progress);
          } else if (progress.phase === 'error') {
            reject(new Error(progress.error?.message || 'Analysis failed'));
          } else {
            // Continue polling
            setTimeout(poll, pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };

      // Start polling
      poll();
    });
  }

  /**
   * Start polling for progress and return a cleanup function
   * @param analysisId The unique identifier for the analysis
   * @param onProgress Callback function called with each progress update
   * @param pollInterval Polling interval in milliseconds (default: 2000)
   * @returns Cleanup function to stop polling
   */
  static startProgressPolling(
    analysisId: string,
    onProgress: (progress: AnalysisProgress) => void,
    pollInterval: number = 2000
  ): () => void {
    let isPolling = true;

    const poll = async () => {
      if (!isPolling) return;

      try {
        const progress = await this.checkProgress(analysisId);
        if (isPolling) {
          onProgress(progress);
        }

        if (progress.phase !== 'completed' && progress.phase !== 'error' && isPolling) {
          setTimeout(poll, pollInterval);
        }
      } catch (error) {
        if (isPolling) {
          console.error('Progress polling error:', error);
          onProgress({
            analysisId,
            phase: 'error',
            progress: 0,
            message: 'Failed to check progress',
            timestamp: new Date().toISOString(),
            error: {
              code: 'PROGRESS_CHECK_FAILED',
              message: error instanceof Error ? error.message : 'Unknown error'
            }
          });
        }
      }
    };

    // Start polling
    poll();

    // Return cleanup function
    return () => {
      isPolling = false;
    };
  }
}