import { api } from './api.ts';
import { ApiResponse, Bill, Payment } from '../types/index.ts';

export interface AdminDashboardData {
  totalStudents: number;
  totalActiveStudents: number;
  totalUnpaidBills: number;
  totalPaidBills: number;
  totalCourses: number;
  totalRevenue: number;
  recentPayments: Payment[];
  recentStudents: any[];
}

export const adminService = {
  async getDashboard() {
    const res = await api.get<ApiResponse<AdminDashboardData>>('/admin/dashboard');
    return res.data.data;
  },

  async getStudents(params?: { page?: number; limit?: number; search?: string; study_program_id?: string }) {
    const res = await api.get<ApiResponse<{ items: any[]; meta: any }>>('/admin/students', { params });
    return res.data.data;
  },

  async getStudentById(id: string) {
    const res = await api.get<ApiResponse<any>>(`/admin/students/${id}`);
    return res.data.data;
  },

  async createStudent(data: any) {
    const res = await api.post<ApiResponse<any>>('/admin/students', data);
    return res.data.data;
  },

  async updateStudent(id: string, data: any) {
    const res = await api.patch<ApiResponse<any>>(`/admin/students/${id}`, data);
    return res.data.data;
  },

  async deleteOrDeactivateStudent(id: string) {
    const res = await api.delete<ApiResponse<any>>(`/admin/students/${id}`);
    return res.data.data;
  },

  async createCourse(data: any) {
    const res = await api.post<ApiResponse<any>>('/admin/courses', data);
    return res.data.data;
  },

  async updateCourse(id: string, data: any) {
    const res = await api.patch<ApiResponse<any>>(`/admin/courses/${id}`, data);
    return res.data.data;
  },

  async createSchedule(data: any) {
    const res = await api.post<ApiResponse<any>>('/admin/schedules', data);
    return res.data.data;
  },

  async updateSchedule(id: string, data: any) {
    const res = await api.patch<ApiResponse<any>>(`/admin/schedules/${id}`, data);
    return res.data.data;
  },

  async deleteSchedule(id: string) {
    const res = await api.delete<ApiResponse<any>>(`/admin/schedules/${id}`);
    return res.data.data;
  },

  async getBills(params?: any) {
    const res = await api.get<ApiResponse<{ items: Bill[]; meta: any }>>('/admin/bills', { params });
    return res.data.data;
  },

  async createBill(data: any) {
    const res = await api.post<ApiResponse<Bill>>('/admin/bills', data);
    return res.data.data;
  },

  async getPayments(params?: any) {
    const res = await api.get<ApiResponse<{ items: Payment[]; meta: any }>>('/admin/payments', { params });
    return res.data.data;
  },

  async broadcastNotification(data: any) {
    const res = await api.post<ApiResponse<any>>('/admin/notifications', data);
    return res.data.data;
  },

  async getAuditLogs() {
    const res = await api.get<ApiResponse<any[]>>('/admin/audit-logs');
    return res.data.data;
  },
};
