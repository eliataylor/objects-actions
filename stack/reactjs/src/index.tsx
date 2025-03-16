import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";
import ErrorBoundary from "./theme/ErrorBoundary";

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
  // <React.StrictMode>
  <ErrorBoundary showDebugInfo={process.env.NODE_ENV === "development"}>
    <App />
  </ErrorBoundary>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
