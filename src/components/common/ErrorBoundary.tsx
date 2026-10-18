import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in CineBai:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/20 text-error mb-4">
            <AlertTriangle size={32} aria-hidden="true" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            An unexpected error occurred while rendering this interface.
          </p>

          {this.state.error?.message && (
            <pre className="mt-4 p-3 rounded-md bg-bg-surface border border-border-default text-xs text-text-muted max-w-full overflow-x-auto text-left">
              {this.state.error.message}
            </pre>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              variant="primary"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw size={16} aria-hidden="true" />
              <span>Reload Page</span>
            </Button>
            <a href="/">
              <Button variant="ghost" className="inline-flex items-center gap-2">
                <Home size={16} aria-hidden="true" />
                <span>Return Home</span>
              </Button>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
