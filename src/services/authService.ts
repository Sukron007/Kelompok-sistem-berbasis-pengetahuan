import { api } from './api.ts';
import { ApiResponse, User } from '../types/index.ts';

export const authService = {
  async login(credentials: { email: string; password: string }) {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', credentials);
    return res.data.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('siakad_auth_token');
      localStorage.removeItem('siakad_auth_user');
    }
  },

  async getMe() {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
};
