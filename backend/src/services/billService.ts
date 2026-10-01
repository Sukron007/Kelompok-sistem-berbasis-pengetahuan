import { billRepository } from '../repositories/billRepository.ts';
import { studentRepository } from '../repositories/studentRepository.ts';

export class BillService {
  async getStudentBills(studentId: string, status?: string) {
    return billRepository.findByStudentId(studentId, { status });
  }

  async getBillDetails(billId: string, studentId?: string) {
    const bill = await billRepository.findById(billId);
    if (!bill) {
      throw { statusCode: 404, message: 'Tagihan SPP tidak ditemukan.' };
    }

    // Ownership check if student requested
    if (studentId && bill.student_id !== studentId) {
      throw { statusCode: 403, message: 'Anda tidak memiliki hak akses ke data tagihan ini.' };
    }

    return bill;
  }

  async createBill(data: {
    student_id: string;
    academic_year_id: string;
    bill_type: string;
    semester: number;
    amount: number;
    due_date: string;
    description?: string | null;
  }) {
    const student = await studentRepository.findById(data.student_id);
    if (!student) {
      throw { statusCode: 404, message: 'Mahasiswa tidak ditemukan.' };
    }

    return billRepository.create({
      student_id: data.student_id,
      academic_year_id: data.academic_year_id,
      bill_type: data.bill_type,
      semester: data.semester,
      amount: data.amount,
      due_date: new Date(data.due_date),
      description: data.description,
    });
  }
}

export const billService = new BillService();
