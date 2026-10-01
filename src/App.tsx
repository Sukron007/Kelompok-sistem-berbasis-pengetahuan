import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';

// Layouts
import { StudentLayout } from './layouts/StudentLayout.tsx';
import { AdminLayout } from './layouts/AdminLayout.tsx';

// Pages
import { LoginPage } from './pages/auth/LoginPage.tsx';

// Student Pages
import { DashboardPage } from './pages/student/Dashboard/DashboardPage.tsx';
import { CoursesPage } from './pages/student/Courses/CoursesPage.tsx';
import { AcademicPage } from './pages/student/Academic/AcademicPage.tsx';
import { SchedulePage } from './pages/student/Schedule/SchedulePage.tsx';
import { AssignmentsPage } from './pages/student/Assignments/AssignmentsPage.tsx';
import { AssignmentDetailPage } from './pages/student/Assignments/AssignmentDetailPage.tsx';
import { PaymentsPage } from './pages/student/Payments/PaymentsPage.tsx';
import { ReceiptPage } from './pages/student/Payments/ReceiptPage.tsx';
import { NotificationsPage } from './pages/student/Notifications/NotificationsPage.tsx';
import { ProfilePage } from './pages/student/Profile/ProfilePage.tsx';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/Dashboard/AdminDashboardPage.tsx';
import { AdminStudentsPage } from './pages/admin/Students/AdminStudentsPage.tsx';
import { AdminCoursesPage } from './pages/admin/Courses/AdminCoursesPage.tsx';
import { AdminSchedulesPage } from './pages/admin/Schedules/AdminSchedulesPage.tsx';
import { AdminBillsPage } from './pages/admin/Bills/AdminBillsPage.tsx';
import { AdminPaymentsPage } from './pages/admin/Payments/AdminPaymentsPage.tsx';
import { AdminNotificationsPage } from './pages/admin/Notifications/AdminNotificationsPage.tsx';
import { AdminAuditLogsPage } from './pages/admin/AuditLogs/AdminAuditLogsPage.tsx';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Student Portal Routes */}
          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/academic" element={<AcademicPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/payments/:id/receipt" element={<ReceiptPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Portal Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/schedules" element={<AdminSchedulesPage />} />
            <Route path="/admin/bills" element={<AdminBillsPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
