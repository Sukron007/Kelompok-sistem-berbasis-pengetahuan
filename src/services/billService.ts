import { api } from './api.ts';
import { ApiResponse, Bill } from '../types/index.ts';

export const billService = {
  async getStudentBills(status?: string) {
    const res = await api.get<ApiResponse<Bill[]>>('/bills', {
      params: status ? { status } : undefined,
    });
    return res.data.data;
  },

  async getBillById(id: string) {
    const res = await api.get<ApiResponse<Bill>>(`/bills/${id}`);
    return res.data.data;
  },
};
