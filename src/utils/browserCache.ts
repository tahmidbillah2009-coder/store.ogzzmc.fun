const isBrowser = typeof window !== 'undefined';

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

export function readCache<T>(key: string): T | null {
  if (!isBrowser) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as CacheEntry<T>;
    if (!parsed || typeof parsed.expiresAt !== 'number') {
      window.localStorage.removeItem(key);
      return null;
    }

    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T, ttlMs: number) {
  if (!isBrowser) {
    return;
  }

  try {
    const entry: CacheEntry<T> = {
      expiresAt: Date.now() + ttlMs,
      value,
    };

    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage quota and serialization errors.
  }
}
