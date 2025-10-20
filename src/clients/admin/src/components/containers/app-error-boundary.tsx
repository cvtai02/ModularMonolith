import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ApiError } from '@shared/api/api-types';
import { ROUTES } from '@/configs/routes';
import QueryClient from '@/components/containers/query-client';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled app error:', error, errorInfo);

    if (error instanceof ApiError && error.statusCode === 401) {
      const redirect = window.location.pathname;
      window.location.assign(`${ROUTES.signin}?redirect=${redirect}`);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    QueryClient.clear();
    window.location.reload();
  };

  render() {
    if (!this.state.hasError || !this.state.error) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {this.state.error.message || 'An unexpected error occurred.'}
        </p>
        <button className="rounded-md border px-4 py-2 text-sm font-medium" onClick={this.handleRetry}>
          Retry
        </button>
      </div>
    );
  }
}

export default AppErrorBoundary;
