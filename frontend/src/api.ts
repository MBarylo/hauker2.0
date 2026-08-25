import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://hauker-backend.onrender.com',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // чистимо прострочений токен
      window.location.href = '/login'; // редірект на логін
    }
    return Promise.reject(error);
  },
);
