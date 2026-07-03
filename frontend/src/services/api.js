import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const FRIENDLY_ERROR_MESSAGE = 'Hiện chưa tải được dữ liệu mới. Hệ thống sẽ tự thử lại sau.';

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
