import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/Common/ErrorBoundary'
import './utils/consoleAPITest' // Import console API testing helpers

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);