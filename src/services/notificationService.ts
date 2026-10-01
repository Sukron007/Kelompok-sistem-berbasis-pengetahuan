import { api } from './api.ts';
import { ApiResponse, NotificationItem } from '../types/index.ts';

export const notificationService = {
  async getNotifications() {
    const res = await api.get<ApiResponse<NotificationItem[]>>('/notifications');
    return res.data.data;
  },

  async markAsRead(id: string) {
    const res = await api.patch<ApiResponse<any>>(`/notifications/${id}/read`);
    return res.data.data;
  },

  async markAllAsRead() {
    const res = await api.patch<ApiResponse<{ markedAll: boolean }>>('/notifications/read-all');
    return res.data.data;
  },
};
