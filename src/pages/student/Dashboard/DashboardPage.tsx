import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentService, StudentDashboardData } from '../../../services/studentService.ts';
import { paymentService } from '../../../services/paymentService.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { StatusBadge } from '../../../components/Badge/StatusBadge.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import {
  CreditCard,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await studentService.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handlePayNow = async (billId: string) => {
    try {
      setPaying(true);
      setPaymentMsg(null);
      const result = await paymentService.createPayment(billId);

      // Trigger Midtrans Snap
      paymentService.openSnapPopup(result.snap_token, {
        onSuccess: async () => {
          setPaymentMsg({ type: 'success', text: 'Pembayaran berhasil! Mengupdate status...' });
          await fetchDashboard();
        },
        onPending: async () => {
          setPaymentMsg({ type: 'info', text: 'Menunggu penyelesaian pembayaran di Midtrans.' });
          await fetchDashboard();
        },
        onError: () => {
          setPaymentMsg({ type: 'error', text: 'Pembayaran gagal atau dibatalkan.' });
        },
        onClose: () => {
          // If popup closed without complete callback, navigate to payments page to check status
          navigate('/payments');
        },
      });
    } catch (err: any) {
      setPaymentMsg({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Menyiapkan ringkasan dashboard akademik..." />;
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center text-rose-700">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
        <p className="font-semibold text-sm">Gagal memuat dashboard</p>
        <p className="text-xs text-rose-600 mt-1">{error || 'Data tidak tersedia'}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const { student, stats, activeBill, todaySchedules, upcomingAssignments } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Tahun Akademik {student.academic_year || '2026/2027 Ganjil'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Selamat Datang, {student.full_name} 👋
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            NIM: <span className="font-semibold text-slate-700">{student.student_number}</span> • Semester {student.semester} • {student.study_program}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/schedule"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Lihat Jadwal
          </Link>
          <Link
            to="/payments"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition-colors"
          >
            Portal SPP
          </Link>
        </div>
      </div>

      {paymentMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            paymentMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : paymentMsg.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {paymentMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <span>{paymentMsg.text}</span>
        </div>
      )}

      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SPP Bill Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Tagihan SPP</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              Rp {stats.sppBillAmount.toLocaleString('id-ID')}
            </h3>
            <div className="mt-2">
              <StatusBadge status={stats.sppBillStatus} size="sm" />
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Assignments Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Tugas Kuliah</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {stats.assignmentsCount} Tugas Aktif
            </h3>
            <p className="text-[11px] text-slate-500 mt-2">Perlu diselesaikan</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Schedule Today Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Jadwal Hari Ini</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {stats.todayClassesCount} Kelas
            </h3>
            <p className="text-[11px] text-slate-500 mt-2">Total {stats.totalCredits} SKS semester ini</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SPP Payment Highlight Box */}
      {activeBill && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-indigo-950/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                  Tagihan Aktif
                </span>
                <span className="text-xs text-indigo-200">
                  Semester {activeBill.semester}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                SPP Semester {activeBill.semester}
              </h2>
              <p className="text-indigo-200 text-xs mt-1">
                Jatuh Tempo:{' '}
                <span className="font-semibold text-white">
                  {new Date(activeBill.due_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-3">
              <div className="text-2xl sm:text-3xl font-black text-white">
                Rp {activeBill.amount.toLocaleString('id-ID')}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/payments"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                >
                  Detail Tagihan
                </Link>
                <button
                  onClick={() => handlePayNow(activeBill.id)}
                  disabled={paying}
                  className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {paying ? 'Menghubungkan Midtrans...' : 'Bayar Sekarang (Pay Now)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Today's Classes & Upcoming Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Jadwal Kuliah Hari Ini</h3>
            </div>
            <Link
              to="/schedule"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Semua Jadwal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {todaySchedules.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Tidak ada jadwal kuliah hari ini. Silakan istirahat atau pelajari materi mandiri.
              </p>
            ) : (
              todaySchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="inline-block text-[11px] font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-md">
                      {schedule.start_time} - {schedule.end_time}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {schedule.course?.name || 'Mata Kuliah'}
                    </h4>
                    <p className="text-xs text-slate-500">{schedule.lecturer_name}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500 shrink-0">
                    <div className="flex items-center gap-1 font-medium text-slate-700">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{schedule.room}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{schedule.class_name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Tugas Mendatang</h3>
            </div>
            <Link
              to="/assignments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingAssignments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Belum ada tugas perkuliahan baru saat ini.
              </p>
            ) : (
              upcomingAssignments.map((assignment) => {
                const isSubmitted =
                  assignment.submissions &&
                  assignment.submissions.length > 0 &&
                  assignment.submissions[0].status !== 'BELUM_DIKERJAKAN';

                return (
                  <div
                    key={assignment.id}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-slate-400">
                        {assignment.course?.name || 'Mata Kuliah'}
                      </p>
                      <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">
                        {assignment.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Deadline:{' '}
                        <span className="font-medium text-slate-700">
                          {new Date(assignment.deadline).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge
                        status={isSubmitted ? assignment.submissions![0].status : 'BELUM_DIKERJAKAN'}
                        size="sm"
                      />
                      <Link
                        to={`/assignments/${assignment.id}`}
                        className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-indigo-600 shadow-2xs transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
