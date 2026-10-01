import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService.ts';
import { academicService } from '../../../services/academicService.ts';
import { Bill } from '../../../types/index.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { StatusBadge } from '../../../components/Badge/StatusBadge.tsx';
import { Modal } from '../../../components/Modal/Modal.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import { CreditCard, Plus, Search, Filter, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminBillsPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    student_id: '',
    academic_year_id: '',
    bill_type: 'SPP',
    semester: 5,
    amount: 2500000,
    due_date: '2026-10-31',
    description: 'SPP Reguler Semester Gasal 2026/2027',
  });

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBills({ search, status: statusFilter || undefined });
      setBills(res.items);
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    const loadMasters = async () => {
      try {
        const [stRes, yRes] = await Promise.all([
          adminService.getStudents({ limit: 100 }),
          academicService.getAcademicYears(),
        ]);
        setStudents(stRes.items);
        setYears(yRes);
        if (stRes.items.length > 0 && yRes.length > 0) {
          setFormData((prev) => ({
            ...prev,
            student_id: stRes.items[0].id,
            academic_year_id: yRes[0].id,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadMasters();
  }, [statusFilter]);

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMessage(null);
      await adminService.createBill({
        ...formData,
        semester: Number(formData.semester),
        amount: Number(formData.amount),
      });
      setMessage({ type: 'success', text: 'Tagihan SPP baru berhasil diterbitkan!' });
      setIsModalOpen(false);
      await fetchBills();
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Tagihan SPP</h1>
          <p className="text-xs text-slate-500 mt-1">
            Penerbitan tagihan semesteran, batas waktu pembayaran, dan status pelunasan
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" /> Terbitkan Tagihan SPP
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama mahasiswa atau NIM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBills()}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Semua Status</option>
          <option value="UNPAID">Belum Bayar (UNPAID)</option>
          <option value="PENDING">Menunggu (PENDING)</option>
          <option value="PAID">Lunas (PAID)</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        {loading ? (
          <LoadingSpinner message="Memuat tagihan SPP..." />
        ) : bills.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Tidak ada tagihan SPP ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Mahasiswa</th>
                  <th className="py-3 px-3">Semester</th>
                  <th className="py-3 px-3">Tahun Akademik</th>
                  <th className="py-3 px-3">Nominal Tagihan</th>
                  <th className="py-3 px-3">Jatuh Tempo</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{b.student?.full_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        NIM: {b.student?.student_number} • {b.student?.study_program?.name}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      Semester {b.semester}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {b.academic_year?.name}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      Rp {b.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {new Date(b.due_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Bill Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Penerbitan Tagihan SPP">
        <form onSubmit={handleCreateBill} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Mahasiswa</label>
            <select
              required
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.student_number} - {st.full_name} ({st.study_program?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tahun Akademik</label>
              <select
                required
                value={formData.academic_year_id}
                onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              >
                {years.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester</label>
              <input
                type="number"
                min={1}
                max={14}
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nominal SPP (Rp)</label>
              <input
                type="number"
                min={100000}
                step={50000}
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value, 10) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batas Waktu (Due Date)</label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keterangan Tagihan</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {submitting ? 'Menerbitkan...' : 'Terbitkan Tagihan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
