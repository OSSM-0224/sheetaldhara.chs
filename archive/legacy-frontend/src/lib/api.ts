// Centralized API fetcher that handles auth headers and credentials across all browser environments
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('society_token') : null;
  const userId = typeof window !== 'undefined' ? localStorage.getItem('society_user_id') : null;

  const modifiedInit: RequestInit = { ...(init || {}) };
  const headers = new Headers(modifiedInit.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (userId && !headers.has('x-user-id')) {
    headers.set('x-user-id', userId);
  }

  // Include same-origin or cross-origin cookies if applicable
  if (!modifiedInit.credentials) {
    modifiedInit.credentials = 'include';
  }

  modifiedInit.headers = headers;
  return fetch(input, modifiedInit);
}
