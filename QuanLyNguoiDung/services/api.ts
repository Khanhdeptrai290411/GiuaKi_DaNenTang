import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Đổi thành IP máy bạn (không dùng localhost khi test trên thiết bị thật)
const API_URL = 'http://192.168.1.27:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor để tự động thêm token vào header
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Admin Auth
export const adminAPI = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/admin/register', data),
  
  login: (data: { email: string; password: string; otp_code?: string }) =>
    api.post('/admin/login', data),
  
  logout: () => api.post('/admin/logout'),
  
  getMe: () => api.get('/admin/me'),
  
  // 2FA
  enable2FA: () => api.post('/admin/2fa/enable'),
  disable2FA: () => api.post('/admin/2fa/disable'),
  get2FAStatus: () => api.get('/admin/2fa/status'),
};

// Members CRUD
export const memberAPI = {
  getAll: () => api.get('/members'),
  
  getOne: (id: string) => api.get(`/members/${id}`),
  
  create: (data: { username: string; email: string; password: string; image?: string }) =>
    api.post('/members', data),
  
  update: (id: string, data: { username?: string; email?: string; password?: string; image?: string }) =>
    api.put(`/members/${id}`, data),
  
  delete: (id: string) => api.delete(`/members/${id}`),
  
  exportCSV: () => api.get('/members/export/csv', {
    responseType: 'blob',
  }),
};

export default api;

