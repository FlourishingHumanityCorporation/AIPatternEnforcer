// Simple logger for development
// In production, consider using a proper logging service

const logLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof logLevels;

class Logger {
  private level: LogLevel;
  private context: string;

  constructor(context: string) {
    this.context = context;
    this.level = (process.env.LOG_LEVEL as LogLevel) || "info";
  }

  private shouldLog(level: LogLevel): boolean {
    return logLevels[level] >= logLevels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;

    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
    }

    return `${prefix} ${message}`;
  }

  debug(message: string, data?: any) {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message, data));
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message, data));
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, data));
    }
  }

  error(message: string, error?: any) {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message), error);
    }
  }
}

// Factory function to create loggers
export function createLogger(context: string): Logger {
  return new Logger(context);
}

// Default logger for general use
export const logger = createLogger("app");
