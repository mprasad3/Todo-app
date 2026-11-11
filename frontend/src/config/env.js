const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const env = {
  apiUrl: rawApiUrl.replace(/\/+$/, ''),
};
