export interface ChatError {
  type: 'network' | 'rendering' | 'validation' | 'permission'
  message: string
  code?: string
  recoverable: boolean
  timestamp: Date
  context?: Record<string, any>
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  chatError?: ChatError
}

export interface ErrorRecoveryOptions {
  retry?: () => void
  reset?: () => void
  fallback?: React.ComponentType
}