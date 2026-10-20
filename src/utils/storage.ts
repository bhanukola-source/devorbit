// ============================================================
// DevOrbit — localStorage Utilities
// ============================================================

const STORAGE_PREFIX = 'devorbit_';

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }
}

export function clearAllStorage(): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.error('Failed to clear localStorage:', e);
  }
}

export function exportAllData(): string {
  try {
    const data: Record<string, unknown> = {};
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    keys.forEach(k => {
      const shortKey = k.replace(STORAGE_PREFIX, '');
      try {
        data[shortKey] = JSON.parse(localStorage.getItem(k)!);
      } catch {
        data[shortKey] = localStorage.getItem(k);
      }
    });
    return JSON.stringify(data, null, 2);
  } catch {
    return '{}';
  }
}

export function importData(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return { success: false, error: 'Invalid data format. Expected a JSON object.' };
    }
    // Validate it has expected keys
    const validKeys = [
      'roadmapTopics', 'problems', 'focusSessions', 'projects',
      'notes', 'achievements', 'dailyActivity', 'settings',
      'streak', 'longestStreak', 'lastActiveDate'
    ];
    const dataKeys = Object.keys(data);
    const hasValidKey = dataKeys.some(k => validKeys.includes(k));
    if (dataKeys.length > 0 && !hasValidKey) {
      return { success: false, error: 'No recognized DevOrbit data found in the file.' };
    }
    // Import
    for (const [key, value] of Object.entries(data)) {
      setStorageItem(key, value);
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to parse JSON. The file may be corrupted.' };
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
