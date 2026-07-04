export const API_BASE_URL =
  (import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? 'https://tin-tuc-247-backend.onrender.com' : 'http://localhost:5000'))
    .replace(/\/$/, '');

export const apiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
