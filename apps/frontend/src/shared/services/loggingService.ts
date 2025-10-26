// src/shared/services/loggingService.ts
// Centralized logging service for monitoring and error tracking

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: any;
  stack?: string;
}

class LoggingService {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  /**
   * Logs an informational message
   */
  info(message: string, context?: any) {
    this.log('info', message, context);
  }

  /**
   * Logs a warning message
   */
  warn(message: string, context?: any) {
    this.log('warn', message, context);
  }

  /**
   * Logs an error message
   */
  error(message: string, error?: any, context?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      stack: error instanceof Error ? error.stack : undefined,
    };

    this.logs.push(logEntry);

    // In production, send error to monitoring service
    if (!this.isDevelopment) {
      this.sendToMonitoringService(logEntry);
    }

    // Always log to console in development
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, context, error);
    }
  }

  /**
   * Logs a debug message (only in development)
   */
  debug(message: string, context?: any) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Private method to handle the actual logging
   */
  private log(level: LogEntry['level'], message: string, context?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    this.logs.push(logEntry);

    // Output to console based on level
    switch (level) {
      case 'info':
        console.log(`[INFO] ${message}`, context);
        break;
      case 'warn':
        console.warn(`[WARN] ${message}`, context);
        break;
      case 'debug':
        console.debug(`[DEBUG] ${message}`, context);
        break;
    }
  }

  /**
   * Sends error to external monitoring service (placeholder implementation)
   */
  private sendToMonitoringService(logEntry: LogEntry) {
    // Placeholder for sending to external service like Sentry, LogRocket, etc.
    // In a real implementation, this would send the log to your chosen monitoring service
    console.log('Sending error to monitoring service:', logEntry);
    
    // Example implementation for Sentry:
    // if (window.Sentry) {
    //   window.Sentry.captureException(new Error(logEntry.message), {
    //     contexts: { custom: logEntry.context },
    //     extra: { timestamp: logEntry.timestamp }
    //   });
    // }
  }

  /**
   * Gets recent logs (for debugging purposes)
   */
  getLogs(limit?: number): LogEntry[] {
    if (limit) {
      return this.logs.slice(-limit);
    }
    return [...this.logs];
  }

  /**
   * Clears all logs
   */
  clearLogs() {
    this.logs = [];
  }
}

export const loggingService = new LoggingService();
export default loggingService;