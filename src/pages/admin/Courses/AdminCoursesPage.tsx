import React, { useState, useEffect } from 'react';
import { academicService } from '../../../services/academicService.ts';
import { adminService } from '../../../services/adminService.ts';
import { Course } from '../../../types/index.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { Modal } from '../../../components/Modal/Modal.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import { BookOpen, Plus, Search, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    description: '',
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await academicService.getCourses(search);
      setCourses(data);
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMessage(null);
      await adminService.createCourse({
        ...formData,
        credits: Number(formData.credits),
      });
      setMessage({ type: 'success', text: 'Mata kuliah baru berhasil ditambahkan!' });
      setIsModalOpen(false);
      setFormData({ code: '', name: '', credits: 3, description: '' });
      await fetchCourses();
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Mata Kuliah</h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar kurikulum, kode matkul, dan bobot SKS program studi
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" /> Tambah Mata Kuliah
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

      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau nama mata kuliah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
          />
        </div>
        <button
          onClick={fetchCourses}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cari
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        {loading ? (
          <LoadingSpinner message="Memuat mata kuliah..." />
        ) : courses.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Tidak ada mata kuliah ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Kode Matkul</th>
                  <th className="py-3 px-3">Nama Mata Kuliah</th>
                  <th className="py-3 px-3 text-center">Bobot SKS</th>
                  <th className="py-3 px-3">Deskripsi Kurikulum</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-indigo-700">
                      {course.code}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {course.name}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                        {course.credits} SKS
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 max-w-sm truncate">
                      {course.description || '-'}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        AKTIF
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Mata Kuliah Baru">
        <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Mata Kuliah</label>
              <input
                type="text"
                required
                placeholder="TI-304"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bobot SKS (1-6)</label>
              <input
                type="number"
                min={1}
                max={6}
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value, 10) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Mata Kuliah</label>
            <input
              type="text"
              required
              placeholder="Keamanan Jaringan & Kriptografi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Capaian Pembelajaran</label>
            <textarea
              rows={3}
              placeholder="Membahas teknik enkripsi, autentikasi digital, dan pencegahan serangan cyber..."
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
              {submitting ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
