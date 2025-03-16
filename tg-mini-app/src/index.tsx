import './types';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Изменено с AppWrapper на App
import { Typography } from '@mui/material';

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('Unhandled error:', error);
      setHasError(true);
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return <Typography color="error">Something went wrong. Please try reloading the app.</Typography>;
  }

  return <>{children}</>;
};

console.log('Application initialization started');

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}