import axios from 'axios';

const PRODUCTION_API_URL = 'https://tin-tuc-247-backend.onrender.com/api';

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PRODUCTION_API_URL : 'http://localhost:5000/api');

export const FRIENDLY_ERROR_MESSAGE = 'Hien chua tai duoc du lieu moi. He thong se tu thu lai sau.';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || FRIENDLY_ERROR_MESSAGE;
    return Promise.reject(new Error(message));
  }
);

export default api;
