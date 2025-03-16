import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorPage from "./ErrorPage";

interface ErrorBoundaryProps {
  children: ReactNode;
  showDebugInfo?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  globalError?: {
    message: string;
    source: string;
    lineno: number;
    colno: number;
    error: Error | null;
  };
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };

    // Bind the error handling methods to the class instance
    this.handleGlobalError = this.handleGlobalError.bind(this);
    this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);

    // Attach global error listeners
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection
    );
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    // Optionally send this information to a logging service
    console.error("React Error caught by ErrorBoundary:", error, errorInfo);
  }

  componentWillUnmount() {
    // Remove global error listeners
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection
    );
  }

  handleGlobalError(event: ErrorEvent) {
    this.setState({
      hasError: true,
      globalError: {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      }
    });
    // Optionally send this information to a logging service
    console.error(
      "Global Error:",
      event.message,
      event.filename,
      event.lineno,
      event.colno,
      event.error
    );
  }

  handleUnhandledRejection(event: PromiseRejectionEvent) {
    this.setState({
      hasError: true,
      globalError: {
        message:
          event.reason instanceof Error
            ? event.reason.message
            : "Unhandled Promise Rejection",
        source: "",
        lineno: 0,
        colno: 0,
        error: event.reason instanceof Error ? event.reason : null
      }
    });
    // Optionally send this information to a logging service
    console.error("Unhandled Rejection:", event.reason);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorPage
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          globalError={this.state.globalError}
          showDebugInfo={this.props.showDebugInfo}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
