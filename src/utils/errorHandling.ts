import { ChatError } from '../types/error';

/**
 * Creates a standardized ChatError object
 */
export function createChatError(
  type: ChatError['type'],
  message: string,
  options?: {
    code?: string;
    recoverable?: boolean;
    context?: Record<string, any>;
  }
): ChatError {
  return {
    type,
    message,
    code: options?.code,
    recoverable: options?.recoverable ?? true,
    timestamp: new Date(),
    context: options?.context,
  };
}

/**
 * Determines if an error is recoverable based on its type and properties
 */
export function isRecoverableError(error: ChatError): boolean {
  if (error.recoverable === false) {
    return false;
  }

  // Network errors are usually recoverable
  if (error.type === 'network') {
    return true;
  }

  // Rendering errors are often recoverable with a retry
  if (error.type === 'rendering') {
    return true;
  }

  // Validation errors might be recoverable depending on context
  if (error.type === 'validation') {
    return error.recoverable ?? false;
  }

  // Permission errors are typically not recoverable without user action
  if (error.type === 'permission') {
    return false;
  }

  return error.recoverable ?? true;
}

/**
 * Gets a user-friendly error message based on the error type
 */
export function getUserFriendlyErrorMessage(error: ChatError): string {
  switch (error.type) {
    case 'network':
      return 'Connection problem. Please check your internet connection and try again.';
    case 'rendering':
      return 'There was a problem displaying this content. Please try refreshing.';
    case 'validation':
      return 'Invalid data was encountered. Please try again.';
    case 'permission':
      return 'You don\'t have permission to perform this action.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Logs errors in a consistent format for debugging
 */
export function logError(error: ChatError, context?: string): void {
  const logData = {
    timestamp: error.timestamp.toISOString(),
    type: error.type,
    message: error.message,
    code: error.code,
    recoverable: error.recoverable,
    context: context || 'Unknown',
    errorContext: error.context,
  };

  if (import.meta.env.MODE === 'development') {
    console.error('ChatError:', logData);
  } else {
    // In production, you might want to send this to an error reporting service
    console.error('ChatError:', {
      type: error.type,
      message: error.message,
      timestamp: error.timestamp.toISOString(),
    });
  }
}

/**
 * Creates a retry function with exponential backoff
 */
export function createRetryFunction(
  fn: () => Promise<void> | void,
  maxRetries: number = 3,
  baseDelay: number = 1000
): () => Promise<void> {
  return async () => {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        await fn();
        return;
      } catch (error) {
        retries++;
        
        if (retries >= maxRetries) {
          throw error;
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, retries - 1) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };
}