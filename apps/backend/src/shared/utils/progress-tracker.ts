/**
 * Progress tracking utility for long-running AI analysis
 * 
 * This module provides functionality to track and report progress of AI analysis
 * operations, with support for WebSocket notifications and persistent storage.
 */

import type { AnalysisProgress } from '@cxm6467/ai-interview-prep-types';
import { AnalysisPhase } from '@cxm6467/ai-interview-prep-types';
// Simple console logger replacement
const logger = {
  info: (...args: unknown[]) => console.log('[PROGRESS]', ...args),
  error: (...args: unknown[]) => console.error('[PROGRESS]', ...args),
  warn: (...args: unknown[]) => console.warn('[PROGRESS]', ...args),
  debug: (...args: unknown[]) => console.debug('[PROGRESS]', ...args)
};

/**
 * Progress tracker class for managing analysis progress
 */
export class ProgressTracker {
  private analysisId: string;
  private startTime: number;
  private phases: AnalysisPhase[] = [
    AnalysisPhase.STARTED, 
    AnalysisPhase.PARSING_RESUME, 
    AnalysisPhase.PARSING_JOB_DESCRIPTION, 
    AnalysisPhase.GENERATING_ATS_SCORE, 
    AnalysisPhase.GENERATING_QUESTIONS, 
    AnalysisPhase.GENERATING_PRESENTATIONS,
    AnalysisPhase.GENERATING_CANDIDATE_QUESTIONS, 
    AnalysisPhase.FINALIZING, 
    AnalysisPhase.COMPLETED
  ];
  private currentPhaseIndex: number = 0;

  constructor(analysisId: string) {
    this.analysisId = analysisId;
    this.startTime = Date.now();
  }

  /**
   * Update progress to the next phase
   */
  async nextPhase(): Promise<AnalysisProgress> {
    if (this.currentPhaseIndex < this.phases.length - 1) {
      this.currentPhaseIndex++;
    }
    return this.getCurrentProgress();
  }

  /**
   * Set progress to a specific phase
   */
  async setPhase(phase: AnalysisPhase): Promise<AnalysisProgress> {
    const phaseIndex = this.phases.indexOf(phase);
    if (phaseIndex !== -1) {
      this.currentPhaseIndex = phaseIndex;
    }
    return this.getCurrentProgress();
  }

  /**
   * Mark analysis as completed
   */
  async complete(): Promise<AnalysisProgress> {
    this.currentPhaseIndex = this.phases.length - 1;
    return this.getCurrentProgress();
  }

  /**
   * Mark analysis as failed
   */
  async fail(error: { code: string; message: string; details?: string }): Promise<AnalysisProgress> {
    const progress: AnalysisProgress = {
      analysisId: this.analysisId,
      phase: AnalysisPhase.ERROR,
      progress: 0,
      message: `Analysis failed: ${error.message}`,
      timestamp: new Date().toISOString(),
      error
    };

    logger.error('Analysis failed', { analysisId: this.analysisId, error });
    return progress;
  }

  /**
   * Get current progress status
   */
  private getCurrentProgress(): AnalysisProgress {
    const phase = this.phases[this.currentPhaseIndex];
    const progress = Math.round((this.currentPhaseIndex / (this.phases.length - 1)) * 100);
    const elapsedTime = Date.now() - this.startTime;
    
    // Estimate remaining time based on current progress
    const estimatedTotal = progress > 0 ? (elapsedTime / progress) * 100 : 0;
    const estimatedTimeRemaining = Math.max(0, estimatedTotal - elapsedTime);

    const progressUpdate: AnalysisProgress = {
      analysisId: this.analysisId,
      phase,
      progress,
      message: this.getPhaseMessage(phase),
      timestamp: new Date().toISOString(),
      estimatedTimeRemaining: progress < 100 ? estimatedTimeRemaining : undefined
    };

    logger.debug('Progress update', { analysisId: this.analysisId, phase, progress });
    return progressUpdate;
  }

  /**
   * Get human-readable message for each phase
   */
  private getPhaseMessage(phase: AnalysisPhase): string {
    const messages: Record<AnalysisPhase, string> = {
      'started': 'Analysis started...',
      'parsing_resume': 'Analyzing resume content...',
      'parsing_job_description': 'Processing job requirements...',
      'generating_ats_score': 'Calculating ATS compatibility score...',
      'generating_questions': 'Generating interview questions...',
      'generating_presentations': 'Creating presentation topics...',
      'generating_candidate_questions': 'Preparing strategic questions...',
      'finalizing': 'Finalizing analysis results...',
      'completed': 'Analysis completed successfully!',
      'error': 'Analysis encountered an error'
    };

    return messages[phase] || 'Processing...';
  }
}

/**
 * Simple in-memory progress store (in production, use Redis or DynamoDB)
 */
class ProgressStore {
  private store = new Map<string, AnalysisProgress>();

  async setProgress(progress: AnalysisProgress): Promise<void> {
    this.store.set(progress.analysisId, progress);
    // TODO: In production, store in Redis/DynamoDB and send WebSocket updates
    logger.info('Progress updated', { 
      analysisId: progress.analysisId, 
      phase: progress.phase, 
      progress: progress.progress 
    });
  }

  async getProgress(analysisId: string): Promise<AnalysisProgress | null> {
    return this.store.get(analysisId) || null;
  }

  async deleteProgress(analysisId: string): Promise<void> {
    this.store.delete(analysisId);
  }
}

export const progressStore = new ProgressStore();