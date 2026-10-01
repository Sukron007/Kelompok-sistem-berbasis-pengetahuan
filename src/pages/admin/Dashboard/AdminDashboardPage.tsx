import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, AdminDashboardData } from '../../../services/adminService.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { StatusBadge } from '../../../components/Badge/StatusBadge.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import {
  Users,
  CreditCard,
  Banknote,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Receipt,
  PlusCircle,
  Megaphone,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboard();
        setData(res);
      } catch (err: any) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Menghitung statistik akademik & keuangan SPP..." />;
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-center text-xs">
        {error || 'Data dashboard admin tidak tersedia.'}
      </div>
    );
  }

  const {
    totalStudents,
    totalActiveStudents,
    totalUnpaidBills,
    totalPaidBills,
    totalCourses,
    totalRevenue,
    recentPayments,
    recentStudents,
  } = data;

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Administrator</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring akademik terpusat, keuangan SPP Midtrans, dan administrasi perkuliahan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/bills"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-200 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Terbitkan SPP
          </Link>
          <Link
            to="/admin/notifications"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Megaphone className="w-4 h-4 text-indigo-600" /> Siarkan Pengumuman
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Mahasiswa</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {totalActiveStudents} Mahasiswa Aktif
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Revenue Collected */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Penerimaan SPP (Lunas)</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">
              Rp {(totalRevenue / 1000000).toFixed(1)} Jt
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">{totalPaidBills} Tagihan Lunas</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        {/* Unpaid SPP Bills */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Tagihan SPP Tertunggak</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{totalUnpaidBills}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Perlu pelunasan</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Active Courses */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Mata Kuliah Aktif</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCourses}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Semester Gasal 2026</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Recent Payments & Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Midtrans Transactions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Transaksi SPP Terbaru</h3>
            </div>
            <Link
              to="/admin/payments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Semua Transaksi <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada transaksi pembayaran.</p>
            ) : (
              recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800">{p.student?.full_name || 'Mahasiswa'}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {p.order_id} • {p.payment_type || 'Midtrans'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">
                      Rp {p.gross_amount.toLocaleString('id-ID')}
                    </p>
                    <div className="mt-1 flex justify-end">
                      <StatusBadge status={p.transaction_status} size="sm" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Students Registered */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Mahasiswa Terbaru</h3>
            </div>
            <Link
              to="/admin/students"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Kelola Mahasiswa <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada mahasiswa terdaftar.</p>
            ) : (
              recentStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800">{st.full_name}</p>
                    <p className="text-[11px] text-slate-500">
                      NIM: <span className="font-mono font-medium">{st.student_number}</span> • Semester {st.semester}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {st.study_program?.name || 'Informatika'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
