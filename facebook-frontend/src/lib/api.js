function getBaseUrl() {
  return (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:4000/api'
  );
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const base = getBaseUrl();
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
  const relativePath = String(path || '').replace(/^\/+/, '');
  const url = new URL(relativePath, baseWithSlash);
  const headers = { Accept: 'application/json' };

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await parseJsonSafe(res);
  if (res.ok) return data;

  const message =
    (data && typeof data === 'object' && (data.message || data.msg)) ||
    `Request failed (${res.status})`;

  throw new ApiError(
    Array.isArray(message) ? message.join(', ') : String(message),
    { status: res.status, data },
  );
}

