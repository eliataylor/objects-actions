declare global {
  interface Window {
    gtag: (command: string, eventName: string, params?: Record<string, any>) => void;
    opera: {
      version: () => string;
      [key: string]: any; // Allow other properties if needed
    };
  }
}
