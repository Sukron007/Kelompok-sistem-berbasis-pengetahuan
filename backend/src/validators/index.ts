import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const updateProfileSchema = z.object({
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  photo_url: z.string().url('URL foto tidak valid').optional().nullable(),
});

export const createPaymentSchema = z.object({
  bill_id: z.string().min(1, 'ID tagihan wajib disertakan'),
  payment_method: z.enum(['bni', 'mandiri', 'seabank', 'bsi', 'qris', 'all']).optional(),
});

export const gradeSubmissionSchema = z.object({
  score: z.number().min(0, 'Nilai minimal 0').max(100, 'Nilai maksimal 100'),
  feedback: z.string().max(500, 'Feedback maksimal 500 karakter').optional(),
});

export const createAssignmentSchema = z.object({
  course_id: z.string().min(1, 'Mata kuliah wajib dipilih'),
  title: z.string().min(3, 'Judul tugas minimal 3 karakter').max(150),
  description: z.string().min(5, 'Deskripsi tugas wajib diisi'),
  instructions: z.string().optional().nullable(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), 'Format tanggal deadline tidak valid'),
  attachment_url: z.string().url('URL lampiran tidak valid').optional().nullable(),
});

export const createCourseSchema = z.object({
  code: z.string().min(2, 'Kode mata kuliah minimal 2 karakter').max(20),
  name: z.string().min(3, 'Nama mata kuliah minimal 3 karakter').max(100),
  credits: z.number().int().min(1).max(6),
  description: z.string().optional().nullable(),
});

export const createScheduleSchema = z.object({
  course_id: z.string().min(1, 'Mata kuliah wajib dipilih'),
  lecturer_name: z.string().min(3, 'Nama dosen minimal 3 karakter').max(100),
  class_name: z.string().min(1, 'Nama kelas wajib diisi').max(20),
  room: z.string().min(1, 'Ruang kelas wajib diisi').max(50),
  day_of_week: z.enum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam mulai harus HH:MM'),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam selesai harus HH:MM'),
});

export const createBillSchema = z.object({
  student_id: z.string().min(1, 'Mahasiswa wajib dipilih'),
  academic_year_id: z.string().min(1, 'Tahun akademik wajib dipilih'),
  bill_type: z.literal('SPP'),
  semester: z.number().int().min(1).max(14),
  amount: z.number().int().positive('Nominal SPP harus positif'),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Format batas tanggal bayar tidak valid'),
  description: z.string().optional().nullable(),
});

export const createStudentSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  student_number: z.string().min(4, 'NIM minimal 4 karakter').max(20),
  full_name: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(100),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  faculty_id: z.string().min(1, 'Fakultas wajib dipilih'),
  study_program_id: z.string().min(1, 'Program studi wajib dipilih'),
  academic_year_id: z.string().min(1, 'Tahun akademik wajib dipilih'),
  semester: z.number().int().min(1).max(14).default(1),
});

export const updateStudentSchema = z.object({
  full_name: z.string().min(3).max(100).optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  semester: z.number().int().min(1).max(14).optional(),
  is_active: z.boolean().optional(),
});

export const createNotificationSchema = z.object({
  title: z.string().min(3, 'Judul notifikasi minimal 3 karakter').max(100),
  message: z.string().min(5, 'Isi notifikasi minimal 5 karakter').max(500),
  type: z.enum(['BILL_CREATED', 'PAYMENT_SUCCESS', 'ASSIGNMENT_CREATED', 'SCHEDULE_CHANGED', 'ANNOUNCEMENT']),
  target_student_id: z.string().optional().nullable(),
});

export const createFacultySchema = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(3).max(100),
});

export const createStudyProgramSchema = z.object({
  faculty_id: z.string().min(1),
  code: z.string().min(2).max(20),
  name: z.string().min(3).max(100),
});
