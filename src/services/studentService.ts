import { api } from './api.ts';
import { ApiResponse, StudentProfile, CourseSchedule, Assignment, Bill, NotificationItem } from '../types/index.ts';

export interface StudentDashboardData {
  student: StudentProfile;
  stats: {
    sppBillAmount: number;
    sppBillStatus: string;
    assignmentsCount: number;
    todayClassesCount: number;
    totalCredits: number;
    unreadNotificationsCount: number;
  };
  activeBill: Bill | null;
  todaySchedules: CourseSchedule[];
  upcomingAssignments: Assignment[];
  recentNotifications: NotificationItem[];
}

export const studentService = {
  async getDashboard() {
    const res = await api.get<ApiResponse<StudentDashboardData>>('/student/dashboard');
    return res.data.data;
  },

  async getProfile() {
    const res = await api.get<ApiResponse<StudentProfile>>('/student/profile');
    return res.data.data;
  },

  async updateProfile(data: { phone?: string | null; address?: string | null; photo_url?: string | null }) {
    const res = await api.put<ApiResponse<StudentProfile>>('/student/profile', data);
    return res.data.data;
  },

  async uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await api.post<ApiResponse<StudentProfile>>('/student/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },
};
