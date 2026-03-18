const KEY = 'fbclone_auth';

export function loadAuth() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.accessToken || !parsed?.expiry) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuth(payload) {
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

