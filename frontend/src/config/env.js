const DEFAULT_API_URL = '/api/v1';
const LOCAL_HOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i;

function resolveApiUrl() {
  const configured = import.meta.env.VITE_API_URL;
  if (!configured) return DEFAULT_API_URL;

  // A localhost API URL only works when the app itself runs locally. On a
  // deployed site, fall back to the API served from the same origin.
  const pageIsLocal =
    typeof window !== 'undefined' && LOCAL_HOST_RE.test(window.location.origin);
  if (LOCAL_HOST_RE.test(configured) && !pageIsLocal) return DEFAULT_API_URL;

  return configured;
}

export const env = {
  apiUrl: resolveApiUrl().replace(/\/+$/, ''),
};
