/**
 * Central API fetch wrapper with cookie credentials and fallback token handling
 */

// Set VITE_API_URL when the API is hosted separately from the frontend
// (e.g. https://your-api.onrender.com). Leave it unset when the API serves the
// frontend itself, and requests stay same-origin on relative paths.
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

// Without a timeout a hung Render instance leaves the UI spinning forever with no
// retry path, because the request never settles and the caller's finally block
// never runs.
const REQUEST_TIMEOUT_MS = 20000;

function resolveUrl(endpoint: string): string {
  if (/^https?:\/\//.test(endpoint)) return endpoint;
  return `${API_BASE_URL}${endpoint}`;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('society_token');

  const headers = new Headers(options.headers || {});

  // Only declare a content type when there is actually a body. Setting
  // Content-Type on a GET makes it a non-simple request, which forces a CORS
  // preflight on every cross-origin read.
  const hasBody = options.body != null && !(options.body instanceof FormData);
  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Respect a caller-supplied signal while still enforcing our own timeout.
  const callerSignal = options.signal;
  const onCallerAbort = () => controller.abort();
  callerSignal?.addEventListener('abort', onCallerAbort);

  try {
    return await fetch(resolveUrl(endpoint), {
      ...options,
      headers,
      credentials: 'include', // required so the httpOnly session cookie is sent cross-origin
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', onCallerAbort);
  }
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T;
  /** Message suitable for showing to a user. Null on success. */
  error: string | null;
}

/**
 * Fetch + parse in one step.
 *
 * The previous pattern across the app was `const data = await res.json()` before
 * checking `res.ok`. Against a JSON error body that happened to work, but a
 * proxy 502/504 serves HTML, so the parse threw and the user saw
 * "Unexpected token '<'" instead of anything actionable. This always reads the
 * status first and always produces a presentable message.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  let response: Response;

  try {
    response = await apiFetch(endpoint, options);
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return {
        ok: false,
        status: 0,
        data: {} as T,
        error: 'The server took too long to respond. Please check your connection and try again.',
      };
    }
    return {
      ok: false,
      status: 0,
      data: {} as T,
      error: 'Could not reach the server. Please check your connection and try again.',
    };
  }

  let data: any = {};
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    // Non-JSON body (proxy error page, or an empty 204). Keep data as {}.
    data = {};
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data: data as T,
      error:
        data?.error ||
        (response.status === 429
          ? 'Too many requests. Please wait a moment and try again.'
          : response.status >= 500
            ? 'The server ran into a problem. Please try again shortly.'
            : 'Request failed. Please try again.'),
    };
  }

  return { ok: true, status: response.status, data: data as T, error: null };
}
