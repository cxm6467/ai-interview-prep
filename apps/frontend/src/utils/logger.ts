/**
 * Frontend Emoji Logger
 * Professional logging with fun emojis for browser development
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogContext {
  component?: string;
  userId?: string;
  sessionId?: string;
  action?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: string;
  emoji: string;
  message: string;
  context?: LogContext;
  data?: unknown;
  stack?: string;
}

class FrontendLogger {
  private currentLogLevel: LogLevel;
  private service: string;

  constructor(service: string = 'Frontend', logLevel?: LogLevel) {
    this.service = service;
    this.currentLogLevel = logLevel ?? this.parseLogLevel() ?? this.getDefaultLogLevel();
  }

  private getDefaultLogLevel(): LogLevel {
    // In production builds, default to ERROR level to minimize console noise
    // In development, use INFO level for better debugging
    return import.meta.env.PROD ? LogLevel.ERROR : LogLevel.INFO;
  }

  private parseLogLevel(): LogLevel | undefined {
    // Check localStorage (persistent preference)
    const storageLogLevel = localStorage.getItem('logLevel');
    
    // Check environment variable (if available in build)
    const envLogLevel = import.meta.env?.VITE_LOG_LEVEL;
    
    const level = storageLogLevel || envLogLevel;
    
    if (!level) return undefined;
    
    const levelMap: Record<string, LogLevel> = {
      'debug': LogLevel.DEBUG,
      'info': LogLevel.INFO,
      'warn': LogLevel.WARN,
      'error': LogLevel.ERROR
    };
    
    return levelMap[level.toLowerCase()];
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel;
  }

  private formatMessage(entry: LogEntry): unknown[] {
    const timestamp = entry.timestamp;
    const level = entry.level.padEnd(5);
    const emoji = entry.emoji;
    const service = this.service;
    
    const message = `${timestamp} [${level}] ${emoji} [${service}] ${entry.message}`;
    
    const args: unknown[] = [message];
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      args.push('Context:', entry.context);
    }
    
    if (entry.data) {
      args.push('Data:', entry.data);
    }
    
    return args;
  }

  private log(level: LogLevel, emoji: string, message: string, context?: LogContext, data?: unknown, error?: Error): void {
    if (!this.shouldLog(level)) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      emoji,
      message,
      context,
      data,
      stack: error?.stack
    };
    
    const args = this.formatMessage(entry);
    
    // Use appropriate console method based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(...args);
        if (error) console.debug('Stack:', error.stack);
        break;
      case LogLevel.INFO:
        console.info(...args);
        break;
      case LogLevel.WARN:
        console.warn(...args);
        if (error) console.warn('Stack:', error.stack);
        break;
      case LogLevel.ERROR:
        console.error(...args);
        if (error) console.error('Error:', error);
        break;
    }
  }

  // Debug level - development details
  debug(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.DEBUG, '🔍', message, context, data);
  }

  // Info level - general application flow
  info(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.INFO, '📝', message, context, data);
  }

  // Success - positive outcomes
  success(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.INFO, '✅', message, context, data);
  }

  // Component lifecycle
  component(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.DEBUG, '🧩', message, context, data);
  }

  // User interactions
  user(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.INFO, '👤', message, context, data);
  }

  // API calls
  api(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.INFO, '🌐', message, context, data);
  }

  // File operations
  file(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.INFO, '📄', message, context, data);
  }

  // Performance metrics
  performance(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.INFO, '⚡', message, context, data);
  }

  // Warn level - potential issues
  warn(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.WARN, '⚠️', message, context, data);
  }

  // Validation failures
  validationError(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.WARN, '❓', message, context, data);
  }

  // Error level - serious issues
  error(message: string, context?: LogContext, data?: unknown, error?: Error): void {
    this.log(LogLevel.ERROR, '❌', message, context, data, error);
  }

  // Network failures
  networkError(message: string, context?: LogContext, data?: unknown, error?: Error): void {
    this.log(LogLevel.ERROR, '📡', message, context, data, error);
  }

  // Parsing failures
  parseError(message: string, context?: LogContext, data?: unknown, error?: Error): void {
    this.log(LogLevel.ERROR, '📋', message, context, data, error);
  }

  // Request/Response logging helpers
  apiStart(method: string, url: string, context?: LogContext): void {
    this.api(`${method} ${url} started`, context);
  }

  apiEnd(method: string, url: string, status: number, duration: number, context?: LogContext): void {
    const emoji = status >= 400 ? '❌' : status >= 300 ? '↩️' : '✅';
    this.log(LogLevel.INFO, emoji, `${method} ${url} completed`, { 
      status, 
      duration: duration,
      ...context 
    });
  }

  // Component lifecycle helpers
  componentMount(componentName: string, context?: LogContext): void {
    this.component(`${componentName} mounted`, context);
  }

  componentUnmount(componentName: string, context?: LogContext): void {
    this.component(`${componentName} unmounted`, context);
  }

  // Create child logger with additional context
  child(context: LogContext): FrontendLogger {
    const childLogger = new FrontendLogger(this.service, this.currentLogLevel);
    
    // Override log method to include parent context
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level: LogLevel, emoji: string, message: string, childContext?: LogContext, data?: unknown, error?: Error) => {
      originalLog(level, emoji, message, { ...context, ...childContext }, data, error);
    };
    
    return childLogger;
  }
}

// Default logger instance
export const logger = new FrontendLogger();

// Component-specific loggers
export const createLogger = (component: string, logLevel?: LogLevel) => 
  new FrontendLogger(component, logLevel);

export { FrontendLogger };
export type { LogContext };