import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing records safely if any
  await prisma.auditLog.deleteMany();
  await prisma.notificationRead.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.paymentLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.courseSchedule.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.studyProgram.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.user.deleteMany();

  // 2. Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2026/2027 Ganjil',
      start_date: new Date('2026-09-01T00:00:00Z'),
      end_date: new Date('2027-02-28T23:59:59Z'),
      is_active: true,
    },
  });

  // 3. Faculty & Study Program
  const faculty = await prisma.faculty.create({
    data: {
      code: 'FTI',
      name: 'Fakultas Teknologi Informasi',
    },
  });

  const studyProgram = await prisma.studyProgram.create({
    data: {
      faculty_id: faculty.id,
      code: 'TI',
      name: 'Teknik Informatika (S1)',
    },
  });

  // 4. Passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const studentPasswordHash = await bcrypt.hash('student123', 10);

  // 5. Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@siakad.ac.id',
      password_hash: adminPasswordHash,
      role: 'ADMIN',
      is_active: true,
    },
  });

  // 6. Student User & Profile
  const studentUser = await prisma.user.create({
    data: {
      email: 'mahasiswa@siakad.ac.id',
      password_hash: studentPasswordHash,
      role: 'MAHASISWA',
      is_active: true,
    },
  });

  const student = await prisma.student.create({
    data: {
      user_id: studentUser.id,
      student_number: '202401001',
      full_name: 'Budi Pratama',
      phone: '+6281234567890',
      address: 'Jl. Boulevard Kampus Merdeka No. 45, Jakarta',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      faculty_id: faculty.id,
      study_program_id: studyProgram.id,
      academic_year_id: academicYear.id,
      semester: 5,
      is_active: true,
    },
  });

  // 7. Courses
  const course1 = await prisma.course.create({
    data: {
      code: 'TI-301',
      name: 'Pemrograman Web Modern (React & Node.js)',
      credits: 3,
      description: 'Mempelajari arsitektur fullstack modern, state management, REST API, dan integrasi payment gateway.',
    },
  });

  const course2 = await prisma.course.create({
    data: {
      code: 'TI-302',
      name: 'Basis Data Lanjut (SQL & Optimization)',
      credits: 3,
      description: 'Mempelajari relasi database, indexing, transaksi ACID, dan ORM dalam skala enterprise.',
    },
  });

  const course3 = await prisma.course.create({
    data: {
      code: 'TI-303',
      name: 'Rekayasa Perangkat Lunak',
      credits: 3,
      description: 'Prinsip software engineering, lifecycle, agile, security best practices, and code testing.',
    },
  });

  // 8. Schedules
  await prisma.courseSchedule.create({
    data: {
      course_id: course1.id,
      lecturer_name: 'Dr. Ir. Hendra Gunawan, M.T.',
      class_name: 'TI-5A',
      room: 'Lab Komputer 3',
      day_of_week: 'Senin',
      start_time: '08:00',
      end_time: '10:30',
    },
  });

  await prisma.courseSchedule.create({
    data: {
      course_id: course2.id,
      lecturer_name: 'Siti Aminah, M.Kom.',
      class_name: 'TI-5A',
      room: 'Gedung B - R. 402',
      day_of_week: 'Rabu',
      start_time: '10:00',
      end_time: '12:30',
    },
  });

  await prisma.courseSchedule.create({
    data: {
      course_id: course3.id,
      lecturer_name: 'Prof. Bambang Sutrisno, Ph.D.',
      class_name: 'TI-5A',
      room: 'Gedung Utama - R. 201',
      day_of_week: 'Kamis',
      start_time: '13:00',
      end_time: '15:30',
    },
  });

  // 9. Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      course_id: course1.id,
      title: 'Tugas 1: Integrasi Midtrans Snap & Webhook REST API',
      description: 'Implementasikan flow pembayaran SPP menggunakan Midtrans Snap SDK dan verifikasi status pembayaran via Webhook idempotent.',
      instructions: 'Upload file laporan PDF atau link repository GitHub yang memuat implementasi backend dan frontend.',
      deadline: new Date('2026-10-15T23:59:59Z'),
      attachment_url: 'https://docs.midtrans.com/en/snap/overview',
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      course_id: course2.id,
      title: 'Tugas 2: Desain Skema Relasional & Transaksi Finansial',
      description: 'Rancang ERD ternormalisasi 3NF untuk sistem pembayaran SPP multi-channel dengan pencegahan race condition.',
      instructions: 'Kirimkan skrip DDL SQL dan dokumen diagram relasi ERD.',
      deadline: new Date('2026-10-18T23:59:59Z'),
    },
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      course_id: course3.id,
      title: 'Tugas 3: Analisis Kebutuhan Sistem Informasi Akademik',
      description: 'Buat Software Requirement Specification (SRS) untuk modul KRS dan SPP online.',
      instructions: 'Format dokumen PDF IEEE Std 830.',
      deadline: new Date('2026-10-25T23:59:59Z'),
    },
  });

  // 10. SPP Bill (1 Bill, UNPAID, Rp2.500.000)
  const bill = await prisma.bill.create({
    data: {
      student_id: student.id,
      academic_year_id: academicYear.id,
      bill_type: 'SPP',
      semester: 5,
      amount: 2500000,
      due_date: new Date('2026-10-15T23:59:59Z'),
      status: 'UNPAID',
      description: 'SPP Reguler Semester Gasal 2026/2027 Program Studi S1 Teknik Informatika',
    },
  });

  // 11. Initial Notifications
  await prisma.notification.create({
    data: {
      title: 'Tagihan SPP Semester 5 Diterbitkan',
      message: 'Tagihan SPP Semester 5 sebesar Rp2.500.000 telah diterbitkan. Harap lakukan pembayaran sebelum 15 Oktober 2026.',
      type: 'BILL_CREATED',
      target_student_id: student.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Jadwal Kuliah Semester Gasal 2026/2027 Aktif',
      message: 'Perkuliahan semester ini telah aktif. Silakan cek menu Jadwal Kuliah untuk melihat ruang dan jam kuliah.',
      type: 'ANNOUNCEMENT',
      target_student_id: null, // broadcast to all
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Tugas Baru: Integrasi Midtrans Snap',
      message: 'Dosen Dr. Ir. Hendra Gunawan telah mempublikasikan tugas baru untuk mata kuliah Pemrograman Web Modern.',
      type: 'ASSIGNMENT_CREATED',
      target_student_id: student.id,
    },
  });

  // 12. Audit Log
  await prisma.auditLog.create({
    data: {
      user_id: adminUser.id,
      action: 'SYSTEM_SEEDED',
      entity: 'SYSTEM',
      details: 'Initial academic records, student, course schedules, and SPP bill seeded successfully.',
    },
  });

  console.log('✅ Seed completed successfully:');
  console.log(`- Admin: admin@siakad.ac.id / admin123`);
  console.log(`- Mahasiswa: mahasiswa@siakad.ac.id / student123 (NIM: 202401001)`);
  console.log(`- Bill ID: ${bill.id} (Rp 2.500.000 - UNPAID)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
