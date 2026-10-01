export type UserRole = 'MAHASISWA' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  student?: StudentProfile | null;
}

export interface StudentProfile {
  id: string;
  student_number: string;
  full_name: string;
  phone?: string | null;
  photo_url?: string | null;
  address?: string | null;
  semester: number;
  faculty?: string;
  faculty_code?: string;
  study_program?: string;
  study_program_code?: string;
  academic_year?: string;
  is_active?: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  description?: string | null;
  is_active: boolean;
  schedules?: CourseSchedule[];
}

export interface CourseSchedule {
  id: string;
  course_id: string;
  lecturer_name: string;
  class_name: string;
  room: string;
  day_of_week: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  start_time: string;
  end_time: string;
  course?: Course;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  instructions?: string | null;
  deadline: string;
  attachment_url?: string | null;
  created_at: string;
  course?: Course;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url: string;
  file_name?: string | null;
  submitted_at: string;
  status: 'BELUM_DIKERJAKAN' | 'DIKERJAKAN' | 'DIKUMPULKAN' | 'TERLAMBAT' | 'DINILAI';
  score?: number | null;
  feedback?: string | null;
  student?: {
    id: string;
    student_number: string;
    full_name: string;
  };
  assignment?: Assignment;
}

export interface Bill {
  id: string;
  student_id: string;
  academic_year_id: string;
  bill_type: string;
  semester: number;
  amount: number;
  due_date: string;
  status: 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  description?: string | null;
  created_at: string;
  student?: {
    id: string;
    student_number: string;
    full_name: string;
    study_program?: { name: string };
  };
  academic_year?: {
    id: string;
    name: string;
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  bill_id: string;
  student_id: string;
  order_id: string;
  transaction_id?: string | null;
  gross_amount: number;
  payment_type?: string | null;
  transaction_status: 'pending' | 'settlement' | 'capture' | 'deny' | 'cancel' | 'expire' | 'failure' | 'refund';
  fraud_status?: string | null;
  snap_token?: string | null;
  snap_redirect_url?: string | null;
  settlement_time?: string | null;
  created_at: string;
  bill?: Bill;
  student?: StudentProfile;
  receipt?: Receipt | null;
}

export interface Receipt {
  id: string;
  payment_id: string;
  receipt_number: string;
  issued_at: string;
  file_url?: string | null;
  created_at: string;
  payment?: Payment;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'BILL_CREATED' | 'PAYMENT_SUCCESS' | 'ASSIGNMENT_CREATED' | 'SCHEDULE_CHANGED' | 'ANNOUNCEMENT';
  target_student_id?: string | null;
  created_at: string;
  is_read: boolean;
  read_at?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any[];
}
