/**
 * Central API fetch wrapper with cookie credentials and fallback token handling
 */

// Set VITE_API_URL when the API is hosted separately from the frontend
// (e.g. https://your-api.onrender.com). Leave it unset when the API serves the
// frontend itself, and requests stay same-origin on relative paths.
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

function resolveUrl(endpoint: string): string {
  if (/^https?:\/\//.test(endpoint)) return endpoint;
  return `${API_BASE_URL}${endpoint}`;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('society_token');

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(resolveUrl(endpoint), {
    ...options,
    headers,
    credentials: 'include', // required so the httpOnly session cookie is sent cross-origin
  });

  return response;
}
