import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            <h2 className="font-bold mb-2">Application Error</h2>
            <p>Error: {this.state.error?.message}</p>
            <details className="mt-2">
              <summary className="cursor-pointer">Stack trace</summary>
              <pre className="text-xs mt-2 overflow-auto">{this.state.error?.stack}</pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
