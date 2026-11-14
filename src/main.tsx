import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const registerSw = () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Progressive enhancement: ignore registration failure in restricted environments
    });
  };
  if (document.readyState === 'complete') {
    registerSw();
  } else {
    window.addEventListener('load', registerSw, { once: true });
  }
}
