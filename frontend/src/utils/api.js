import axios from 'axios';
import Cookies from 'js-cookie';

// Create a unified Axios instance
// In Vite dev mode with proxy, relative URL '/api' routes smoothly without CORS or port issues.
// If direct port 5000 is needed, it transparently handles it.
const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Smart fallback interceptor: if proxy '/api' fails with network error, retry with 'http://localhost:5000/api'
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response && !originalRequest._retried) {
      originalRequest._retried = true;
      try {
        originalRequest.baseURL = 'http://localhost:5000/api';
        return await axios(originalRequest);
      } catch (retryError) {
        if (!retryError.response) {
          originalRequest.baseURL = 'http://127.0.0.1:5000/api';
          return await axios(originalRequest);
        }
        return Promise.reject(retryError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
