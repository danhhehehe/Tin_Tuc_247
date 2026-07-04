import axios from 'axios';
import { API_BASE_URL, apiUrl } from '../config/api.js';

export const API_URL = apiUrl('/api');

export const FRIENDLY_ERROR_MESSAGE = 'Hien chua tai duoc du lieu moi. He thong se tu thu lai sau.';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
  withCredentials: true
});

export { API_BASE_URL, apiUrl };

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || FRIENDLY_ERROR_MESSAGE;
    return Promise.reject(new Error(message));
  }
);

export default api;
