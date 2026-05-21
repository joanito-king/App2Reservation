import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

// Global error logger to help remote debugging
window.onerror = function (message, source, lineno, colno, error) {
  alert('CRITICAL ERROR: ' + message + ' at ' + source + ':' + lineno + ':' + colno);
  return false;
};
window.addEventListener('unhandledrejection', function (event) {
  alert('UNHANDLED REJECTION: ' + (event.reason?.message || JSON.stringify(event.reason)));
});
const originalConsoleError = console.error;
console.error = function (...args) {
  const formatted = args.map(arg => {
    if (arg && typeof arg === 'object') {
      try {
        return JSON.stringify(arg, Object.getOwnPropertyNames(arg), 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');
  alert('CONSOLE ERROR: ' + formatted);
  originalConsoleError.apply(console, args);
};

async function bootstrap() {
  const { default: App } = await import('./App.jsx');
  ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}

bootstrap();
