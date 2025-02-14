declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    opera: any;
  }
}
