import { useState, useEffect, useCallback } from 'react';

const PREFIX = 'sacred_';

export function loadFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(`${PREFIX}${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {}
}

// React hook for persistent state
export function usePersisted(key, initialValue) {
  const [value, setValue] = useState(() => loadFromStorage(key, initialValue));

  useEffect(() => {
    saveToStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
