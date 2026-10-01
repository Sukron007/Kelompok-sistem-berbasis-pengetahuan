import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { Modal } from '../../../components/Modal/Modal.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import { Megaphone, Plus, Bell, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'ANNOUNCEMENT',
    target_student_id: '',
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await adminService.getStudents({ limit: 100 });
        setStudents(res.items);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStudents();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMessage(null);
      await adminService.broadcastNotification({
        ...formData,
        target_student_id: formData.target_student_id || null,
      });
      setMessage({ type: 'success', text: 'Pengumuman / notifikasi berhasil disiarkan ke mahasiswa!' });
      setFormData({
        title: '',
        message: '',
        type: 'ANNOUNCEMENT',
        target_student_id: '',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Siaran Notifikasi & Pengumuman</h1>
        <p className="text-xs text-slate-500 mt-1">
          Kirimkan pengumuman akademik, pengingat SPP, atau info jadwal kuliah secara real-time
        </p>
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

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Target Mahasiswa</label>
            <select
              value={formData.target_student_id}
              onChange={(e) => setFormData({ ...formData, target_student_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
            >
              <option value="">Semua Mahasiswa (Broadcast Global Kampus)</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  Spesifik: {st.student_number} - {st.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Tipe Notifikasi</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
            >
              <option value="ANNOUNCEMENT">Pengumuman Umum (ANNOUNCEMENT)</option>
              <option value="BILL_CREATED">Pengingat Tagihan SPP (BILL_CREATED)</option>
              <option value="SCHEDULE_CHANGED">Perubahan Jadwal (SCHEDULE_CHANGED)</option>
              <option value="ASSIGNMENT_CREATED">Tugas Kuliah Baru (ASSIGNMENT_CREATED)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Judul Pengumuman</label>
            <input
              type="text"
              required
              placeholder="Contoh: Batas Akhir Pembayaran SPP Semester Gasal"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Isi Pesan Notifikasi</label>
            <textarea
              rows={4}
              required
              placeholder="Tuliskan detail pengumuman yang akan diterima pada panel notifikasi mahasiswa..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600 leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Megaphone className="w-4 h-4" />
              <span>{submitting ? 'Mengirim Siaran...' : 'Kirim Siaran Sekarang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
