import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService.ts';
import { academicService } from '../../../services/academicService.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { Modal } from '../../../components/Modal/Modal.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [faculties, setFaculties] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Student Form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    student_number: '',
    full_name: '',
    phone: '',
    address: '',
    faculty_id: '',
    study_program_id: '',
    academic_year_id: '',
    semester: 1,
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStudents({ search });
      setStudents(res.items);
      setMeta(res.meta);
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    const loadMasters = async () => {
      try {
        const [f, p, y] = await Promise.all([
          academicService.getFaculties(),
          academicService.getStudyPrograms(),
          academicService.getAcademicYears(),
        ]);
        setFaculties(f);
        setPrograms(p);
        setYears(y);
        if (f.length > 0 && p.length > 0 && y.length > 0) {
          setFormData((prev) => ({
            ...prev,
            faculty_id: f[0].id,
            study_program_id: p[0].id,
            academic_year_id: y[0].id,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadMasters();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMessage(null);
      await adminService.createStudent({
        ...formData,
        semester: Number(formData.semester),
      });
      setMessage({ type: 'success', text: 'Mahasiswa baru berhasil didaftarkan!' });
      setIsAddModalOpen(false);
      setFormData({
        email: '',
        password: '',
        student_number: '',
        full_name: '',
        phone: '',
        address: '',
        faculty_id: faculties[0]?.id || '',
        study_program_id: programs[0]?.id || '',
        academic_year_id: years[0]?.id || '',
        semester: 1,
      });
      await fetchStudents();
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrDeactivate = async (student: any) => {
    const confirmText = `Apakah Anda yakin ingin menghapus atau menonaktifkan mahasiswa ${student.full_name} (${student.student_number})?`;
    if (!window.confirm(confirmText)) return;

    try {
      setMessage(null);
      const res = await adminService.deleteOrDeactivateStudent(student.id);
      setMessage({ type: 'success', text: res.message });
      await fetchStudents();
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Mahasiswa</h1>
          <p className="text-xs text-slate-500 mt-1">
            Data identitas mahasiswa, status registrasi, dan program studi terdaftar
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" /> Tambah Mahasiswa
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
            placeholder="Cari berdasarkan nama, NIM, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
          />
        </div>
        <button
          onClick={fetchStudents}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cari
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        {loading ? (
          <LoadingSpinner message="Memuat data mahasiswa..." />
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Tidak ada data mahasiswa ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">NIM</th>
                  <th className="py-3 px-3">Nama Lengkap</th>
                  <th className="py-3 px-3">Email Akun</th>
                  <th className="py-3 px-3">Program Studi</th>
                  <th className="py-3 px-3 text-center">Semester</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      {st.student_number}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {st.full_name}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-mono">
                      {st.user?.email || '-'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {st.study_program?.name}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                      {st.semester}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          st.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {st.is_active ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteOrDeactivate(st)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus / Nonaktifkan (Aman Finansial)"
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

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Registrasi Mahasiswa Baru"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIM (Nomor Induk)</label>
              <input
                type="text"
                required
                placeholder="202401002"
                value={formData.student_number}
                onChange={(e) => setFormData({ ...formData, student_number: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Dewi Anggraini"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Mahasiswa</label>
              <input
                type="email"
                required
                placeholder="dewi@siakad.ac.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password Awal</label>
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Program Studi</label>
              <select
                value={formData.study_program_id}
                onChange={(e) => setFormData({ ...formData, study_program_id: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester Awal</label>
              <input
                type="number"
                min={1}
                max={14}
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Akun mahasiswa akan terbuat otomatis dengan enkripsi bcrypt dan role MAHASISWA.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {submitting ? 'Menyimpan...' : 'Daftarkan Mahasiswa'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
