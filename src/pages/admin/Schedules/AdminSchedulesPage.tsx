import React, { useState, useEffect } from 'react';
import { academicService } from '../../../services/academicService.ts';
import { adminService } from '../../../services/adminService.ts';
import { CourseSchedule, Course } from '../../../types/index.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { Modal } from '../../../components/Modal/Modal.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import { CalendarDays, Plus, Trash2, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    course_id: '',
    lecturer_name: '',
    class_name: 'TI-5A',
    room: 'Lab Komputer 3',
    day_of_week: 'Senin',
    start_time: '08:00',
    end_time: '10:30',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sData, cData] = await Promise.all([
        academicService.getSchedules(),
        academicService.getCourses(),
      ]);
      setSchedules(sData);
      setCourses(cData);
      if (cData.length > 0) {
        setFormData((prev) => ({ ...prev, course_id: cData[0].id }));
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMessage(null);
      await adminService.createSchedule(formData);
      setMessage({ type: 'success', text: 'Jadwal kuliah berhasil ditambahkan!' });
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Hapus jadwal kuliah ini?')) return;
    try {
      setMessage(null);
      await adminService.deleteSchedule(id);
      setMessage({ type: 'success', text: 'Jadwal kuliah berhasil dihapus.' });
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Jadwal Kuliah</h1>
          <p className="text-xs text-slate-500 mt-1">
            Penetapan hari, ruang, waktu, dan dosen pengampu perkuliahan
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" /> Buat Jadwal Baru
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

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        {loading ? (
          <LoadingSpinner message="Memuat jadwal perkuliahan..." />
        ) : schedules.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Belum ada jadwal kuliah yang dibuat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Hari</th>
                  <th className="py-3 px-3">Waktu</th>
                  <th className="py-3 px-3">Mata Kuliah</th>
                  <th className="py-3 px-3">Dosen Pengampu</th>
                  <th className="py-3 px-3">Ruang / Kelas</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        {item.day_of_week}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                      {item.start_time} - {item.end_time} WIB
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{item.course?.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {item.course?.code} ({item.course?.credits} SKS)
                      </p>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {item.lecturer_name}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      <strong>{item.room}</strong> (Kelas {item.class_name})
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteSchedule(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Schedule Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Jadwal Kuliah">
        <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Mata Kuliah</label>
            <select
              required
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} ({c.credits} SKS)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Dosen Pengampu</label>
              <input
                type="text"
                required
                placeholder="Dr. Hendra Gunawan, M.T."
                value={formData.lecturer_name}
                onChange={(e) => setFormData({ ...formData, lecturer_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Kelas</label>
              <input
                type="text"
                required
                placeholder="TI-5A"
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hari Kuliah</label>
              <select
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              >
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ruang Kuliah</label>
              <input
                type="text"
                required
                placeholder="Lab Komputer 3"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jam Mulai (HH:MM)</label>
              <input
                type="text"
                required
                placeholder="08:00"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jam Selesai (HH:MM)</label>
              <input
                type="text"
                required
                placeholder="10:30"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
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
              {submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
