// Logger interface
interface Logger {
  info: (message: string, ...args: any[]) => void
  error: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  debug: (message: string, ...args: any[]) => void
}

// Global logger for API routes and components
export const logger: Logger = {
  info: (message: string, ...args: any[]) => {
    // Use proper logging in production - replace with your logger
    if (typeof window === 'undefined') {
      process.stdout.write(`[INFO] ${message} ${args.join(' ')}\n`)
    }
  },
  error: (message: string, ...args: any[]) => {
    // Use proper logging in production - replace with your logger
    if (typeof window === 'undefined') {
      process.stderr.write(`[ERROR] ${message} ${args.join(' ')}\n`)
    }
  },
  warn: (message: string, ...args: any[]) => {
    // Use proper logging in production - replace with your logger
    if (typeof window === 'undefined') {
      process.stderr.write(`[WARN] ${message} ${args.join(' ')}\n`)
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
      process.stdout.write(`[DEBUG] ${message} ${args.join(' ')}\n`)
    }
  },
}

// Make logger globally available
declare global {
  var logger: Logger | undefined
}

if (typeof global !== 'undefined') {
  global.logger = logger
}