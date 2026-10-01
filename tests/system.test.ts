import { prisma } from '../backend/src/config/database.ts';
import { authService } from '../backend/src/services/authService.ts';
import { paymentService } from '../backend/src/services/paymentService.ts';
import { studentService } from '../backend/src/services/studentService.ts';
import { adminService } from '../backend/src/services/adminService.ts';
import { billRepository } from '../backend/src/repositories/billRepository.ts';
import { paymentRepository } from '../backend/src/repositories/paymentRepository.ts';
import { notificationRepository } from '../backend/src/repositories/notificationRepository.ts';

async function runTests() {
  console.log('🧪 Starting SIAKAD Pro System Integration Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. Database Health Check
  try {
    const ping = await prisma.$queryRaw`SELECT 1 as result`;
    assert(Boolean(ping), 'Database connection active and responding to queries');
  } catch (e: any) {
    assert(false, `Database connection failed: ${e.message}`);
  }

  // 2. Authentication: Student & Admin
  let studentUser: any;
  let adminUser: any;
  let studentToken = '';
  let adminToken = '';

  try {
    const studentLogin = await authService.login('mahasiswa@siakad.ac.id', 'student123');
    studentUser = studentLogin.user;
    studentToken = studentLogin.token;
    assert(Boolean(studentToken) && studentUser.role === 'MAHASISWA', 'Mahasiswa login with valid credentials');
  } catch (e: any) {
    assert(false, `Mahasiswa login failed: ${e.message}`);
  }

  try {
    const adminLogin = await authService.login('admin@siakad.ac.id', 'admin123');
    adminUser = adminLogin.user;
    adminToken = adminLogin.token;
    assert(Boolean(adminToken) && adminUser.role === 'ADMIN', 'Admin login with valid credentials');
  } catch (e: any) {
    assert(false, `Admin login failed: ${e.message}`);
  }

  // Invalid Login check
  try {
    await authService.login('mahasiswa@siakad.ac.id', 'wrongpassword');
    assert(false, 'Login with incorrect password should be rejected');
  } catch (err: any) {
    assert(err.statusCode === 401, 'Login with incorrect password rejected with 401 Unauthorized');
  }

  // 3. Student Dashboard & Profile
  try {
    const dashboard = await studentService.getDashboard(studentUser.student.id);
    assert(dashboard.student.student_number === '202401001', 'Student dashboard retrieved with correct NIM');
    assert(dashboard.stats.totalCredits > 0, 'Dashboard calculated active course credits');
    assert(dashboard.activeBill !== null, 'Dashboard retrieved active SPP bill');
  } catch (e: any) {
    assert(false, `Student dashboard failed: ${e.message}`);
  }

  // 4. SPP Bill & Midtrans Payment Creation
  let paymentResult: any;
  let testBillId = '';

  try {
    const bills = await billRepository.findByStudentId(studentUser.student.id);
    assert(bills.length > 0, 'Found at least 1 SPP bill for student');
    testBillId = bills[0].id;

    // Create payment
    paymentResult = await paymentService.createPayment(studentUser.student.id, testBillId);
    assert(Boolean(paymentResult.order_id), `Payment generated unique Order ID: ${paymentResult.order_id}`);
    assert(paymentResult.amount === bills[0].amount, 'Payment gross amount matches authoritative database value');
    assert(Boolean(paymentResult.snap_token), 'Generated Midtrans Snap token');

    // Duplicate payment prevention check
    const duplicateCall = await paymentService.createPayment(studentUser.student.id, testBillId);
    assert(duplicateCall.order_id === paymentResult.order_id, 'Duplicate payment call safely returned active pending order without double-charging');
  } catch (e: any) {
    assert(false, `Payment creation failed: ${e.message}`);
  }

  // 5. Unauthorized bill payment check
  try {
    // Attempting to pay with another student's ID
    await paymentService.createPayment('unauthorized_fake_student_id', testBillId);
    assert(false, 'Unauthorized student bill payment must be rejected');
  } catch (err: any) {
    assert(err.statusCode === 404 || err.statusCode === 403, 'Cross-student bill access prevented with 403/404');
  }

  // 6. Midtrans Webhook Processing & ACID Transaction
  let receiptNumber = '';
  try {
    const webhookPayload = {
      order_id: paymentResult.order_id,
      status_code: '200',
      gross_amount: paymentResult.amount.toString(),
      transaction_status: 'settlement',
      fraud_status: 'accept',
      payment_type: 'qris',
      transaction_id: `MIDTRANS-TRX-${Date.now()}`,
      settlement_time: new Date().toISOString(),
    };

    const webhookResult = await paymentService.processMidtransWebhook(webhookPayload);
    assert(webhookResult.transaction_status === 'settlement', 'Webhook processed settlement successfully');
    receiptNumber = webhookResult.receipt_number;
    assert(Boolean(receiptNumber), `Official receipt generated: ${receiptNumber}`);

    // Verify Bill updated to PAID in DB
    const updatedBill = await billRepository.findById(testBillId);
    assert(updatedBill?.status === 'PAID', 'Database Bill status transitioned to PAID atomically');

    // Verify Payment updated to settlement in DB
    const updatedPayment = await paymentRepository.findByOrderId(paymentResult.order_id);
    assert(updatedPayment?.transaction_status === 'settlement', 'Database Payment status transitioned to settlement');
    assert(updatedPayment?.receipt !== null, 'Receipt relation verified in database');

    // Verify Notification generated for student
    const notifications = await notificationRepository.findForStudent(studentUser.student.id);
    const paymentNotif = notifications.find((n) => n.type === 'PAYMENT_SUCCESS');
    assert(Boolean(paymentNotif), 'Payment success notification dispatched to student account');
  } catch (e: any) {
    assert(false, `Midtrans webhook processing failed: ${e.message}`);
  }

  // 7. Webhook Idempotency Check (Duplicate webhook event)
  try {
    const duplicatePayload = {
      order_id: paymentResult.order_id,
      status_code: '200',
      gross_amount: paymentResult.amount.toString(),
      transaction_status: 'settlement',
      fraud_status: 'accept',
      payment_type: 'qris',
      transaction_id: `MIDTRANS-TRX-DUPLICATE`,
    };

    const duplicateWebhookResult = await paymentService.processMidtransWebhook(duplicatePayload);
    assert(duplicateWebhookResult.idempotent === true, 'Duplicate webhook handled idempotently without throwing error');

    // Check receipt count for this payment is still exactly 1
    const receiptCount = await prisma.receipt.count({ where: { payment: { order_id: paymentResult.order_id } } });
    assert(receiptCount === 1, 'Idempotency verified: exactly 1 receipt preserved, no duplicates');
  } catch (e: any) {
    assert(false, `Webhook idempotency test failed: ${e.message}`);
  }

  // 8. Financial History Deletion Protection (Rule 78)
  try {
    const deactivationResult = await adminService.deleteOrDeactivateStudent(studentUser.student.id, adminUser.id);
    assert(
      deactivationResult.deactivated === true,
      'Student with financial history deactivated (archived) rather than deleted (Audit compliance)'
    );

    // Reactivate for further tests
    await prisma.student.update({ where: { id: studentUser.student.id }, data: { is_active: true } });
    await prisma.user.update({ where: { id: studentUser.id }, data: { is_active: true } });
  } catch (e: any) {
    assert(false, `Financial history deactivation test failed: ${e.message}`);
  }

  // 9. Admin Dashboard Metrics Verification
  try {
    const stats = await adminService.getDashboardStats();
    assert(stats.totalStudents >= 1, `Admin verified total students: ${stats.totalStudents}`);
    assert(stats.totalPaidBills >= 1, `Admin verified settled SPP bills: ${stats.totalPaidBills}`);
    assert(stats.totalRevenue >= 2500000, `Admin verified revenue tracking: Rp ${stats.totalRevenue.toLocaleString('id-ID')}`);
  } catch (e: any) {
    assert(false, `Admin dashboard metrics failed: ${e.message}`);
  }

  // 10. Assignment File Submission Support Test
  try {
    const assignments = await prisma.assignment.findMany();
    assert(assignments.length > 0, 'Found assignments to test file submission');
    const targetAssignment = assignments[0];

    const sampleFileBuffer = Buffer.from('Laporan Praktikum Pemrograman Web - SIAKAD Pro 2026', 'utf-8');
    const submissionResult = await studentService.uploadProfilePhoto(
      studentUser.student.id,
      Buffer.from('dummy_image_data'),
      'avatar_test.png',
      'image/png'
    );
    assert(Boolean(submissionResult.photo_url), `Profile picture changed successfully: ${submissionResult.photo_url}`);

    // Test assignment submission with file
    const { assignmentService } = await import('../backend/src/services/assignmentService.ts');
    const fileSubmission = await assignmentService.submitAssignment({
      assignmentId: targetAssignment.id,
      studentId: studentUser.student.id,
      fileBuffer: sampleFileBuffer,
      originalName: 'Laporan_Tugas1_BudiPratama.pdf',
      mimeType: 'application/pdf',
      ipAddress: '127.0.0.1',
    });

    assert(Boolean(fileSubmission.file_url), `File submission supported and saved at: ${fileSubmission.file_url}`);
    assert(fileSubmission.status === 'DIKUMPULKAN' || fileSubmission.status === 'TERLAMBAT', 'Submission status recorded properly');
  } catch (e: any) {
    assert(false, `File submission test failed: ${e.message}`);
  }

  // 11. Payment Channels Verification (BNI, Mandiri, SeaBank, BSI)
  try {
    // Create new test bill for semester 6
    const academicYears = await prisma.academicYear.findMany();
    const newBill = await prisma.bill.create({
      data: {
        student_id: studentUser.student.id,
        academic_year_id: academicYears[0].id,
        bill_type: 'SPP',
        semester: 6,
        amount: 2750000,
        due_date: new Date('2026-11-30T23:59:59Z'),
        status: 'UNPAID',
        description: 'SPP Semester 6 Test Multi-Channel',
      },
    });

    // Test Mandiri channel
    const mandiriRes = await paymentService.createPayment(studentUser.student.id, newBill.id, 'mandiri');
    assert(
      mandiriRes.payment_instructions?.bank === 'Mandiri' &&
      mandiriRes.payment_instructions?.biller_code === '88708',
      'Mandiri payment channel configured with Biller Code 88708'
    );

    // Test BNI channel
    const bniRes = await paymentService.createPayment(studentUser.student.id, newBill.id, 'bni');
    assert(
      bniRes.order_id === mandiriRes.order_id,
      'Active pending payment correctly returned'
    );

    // Reset bill to UNPAID for testing BSI and SeaBank
    await prisma.payment.deleteMany({ where: { bill_id: newBill.id } });
    await prisma.bill.update({ where: { id: newBill.id }, data: { status: 'UNPAID' } });

    // Test BSI channel
    const bsiRes = await paymentService.createPayment(studentUser.student.id, newBill.id, 'bsi');
    assert(
      bsiRes.payment_instructions?.bank === 'BSI (Bank Syariah Indonesia)',
      'BSI Syariah payment channel configured with Virtual Account'
    );

    // Reset bill and test SeaBank
    await prisma.payment.deleteMany({ where: { bill_id: newBill.id } });
    await prisma.bill.update({ where: { id: newBill.id }, data: { status: 'UNPAID' } });

    const seabankRes = await paymentService.createPayment(studentUser.student.id, newBill.id, 'seabank');
    assert(
      seabankRes.payment_instructions?.bank === 'SeaBank',
      'SeaBank payment channel configured with Virtual Account / QRIS'
    );
  } catch (e: any) {
    assert(false, `Payment channels verification test failed: ${e.message}`);
  }

  console.log(`\n================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error('Test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
