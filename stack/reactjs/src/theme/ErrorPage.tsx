import React from "react";
import { Box } from "@mui/material";

interface ErrorPageProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  globalError?: {
    message: string;
    source: string;
    lineno: number;
    colno: number;
    error: Error | null;
  };
  showDebugInfo?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
                                               error,
                                               errorInfo,
                                               globalError,
                                               showDebugInfo = false
                                             }) => {
  return (
    <Box p={2}>
      <h1>Oops! Something went wrong.</h1>
      <p>
        We apologize for the inconvenience. Please try again later or contact
        support if the issue persists.
      </p>
      {showDebugInfo && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f8d7da",
            color: "#721c24"
          }}
        >
          <h2>Debugging Information</h2>
          {error && (
            <>
              <h3>React Error:</h3>
              <pre>{error.message}</pre>
            </>
          )}
          {errorInfo && (
            <>
              <h3>Component Stack:</h3>
              <pre>{errorInfo.componentStack}</pre>
            </>
          )}
          {globalError && (
            <>
              <h3>Global Error Information:</h3>
              <pre>{globalError.message}</pre>
              <pre>{globalError.source}</pre>
              <pre>{`Line: ${globalError.lineno}, Column: ${globalError.colno}`}</pre>
            </>
          )}
        </div>
      )}
    </Box>
  );
};

export default ErrorPage;
