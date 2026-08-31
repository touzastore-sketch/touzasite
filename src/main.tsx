import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import './index.css';

// Unregister any stale or legacy service workers and clear CacheStorage so updates are instantaneous
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    }).catch(() => {});
  }
  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        caches.delete(key);
      });
    }).catch(() => {});
  }
}

// Ensure JSON.stringify never throws cyclic structure errors anywhere in the app lifecycle
if (typeof window !== 'undefined' && window.JSON) {
  const originalStringify = window.JSON.stringify;
  window.JSON.stringify = function (val: any, replacer?: any, space?: any) {
    try {
      const seen = new WeakSet();
      return originalStringify(val, function (this: any, k: string, v: any) {
        if (typeof v === 'object' && v !== null) {
          if (seen.has(v)) return undefined;
          seen.add(v);
        }
        if (typeof replacer === 'function') {
          return replacer.call(this, k, v);
        }
        if (Array.isArray(replacer)) {
          if (k === '' || replacer.includes(k)) return v;
          return undefined;
        }
        return v;
      }, space);
    } catch {
      try {
        if (val === null || val === undefined) return originalStringify(val);
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return originalStringify(val);
        if (Array.isArray(val)) return '[]';
        if (typeof val === 'object') return '{}';
        return originalStringify(String(val));
      } catch {
        return '""';
      }
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
