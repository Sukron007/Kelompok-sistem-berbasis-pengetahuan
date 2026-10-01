import React, { useState, useEffect } from 'react';
import { academicService, AcademicOverview } from '../../../services/academicService.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import { GraduationCap, BookOpen, Award, CheckCircle, School } from 'lucide-react';

export const AcademicPage: React.FC = () => {
  const [data, setData] = useState<AcademicOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await academicService.getOverview();
        setData(res);
      } catch (err: any) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Memuat informasi akademik..." />;
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-center">
        <p className="font-semibold text-sm">Gagal memuat data akademik</p>
        <p className="text-xs mt-1">{error || 'Data tidak ditemukan'}</p>
      </div>
    );
  }

  const { student, summary, courses } = data;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Informasi Akademik</h1>
        <p className="text-xs text-slate-500 mt-1">
          Rencana Studi & Status Perkuliahan Semester Ini
        </p>
      </div>

      {/* Student Identity Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-100">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                MAHASISWA AKTIF
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{student.full_name}</h2>
              <p className="text-xs text-slate-500">
                NIM: <span className="font-semibold text-slate-800">{student.student_number}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-400 font-medium">Program Studi</p>
              <p className="font-bold text-slate-800 mt-0.5">{student.study_program}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-400 font-medium">Fakultas</p>
              <p className="font-bold text-slate-800 mt-0.5">{student.faculty}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
              <p className="text-slate-400 font-medium">Tahun Akademik</p>
              <p className="font-bold text-indigo-700 mt-0.5">{student.academic_year}</p>
            </div>
          </div>
        </div>

        {/* Academic Metric Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Mata Kuliah</p>
              <p className="text-lg font-bold text-slate-900">{summary.totalCourses} Matkul</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Beban SKS Diambil</p>
              <p className="text-lg font-bold text-slate-900">{summary.totalCredits} SKS</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <School className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Semester Aktif</p>
              <p className="text-lg font-bold text-slate-900">Semester {student.semester}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses / KRS Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Kartu Rencana Studi (KRS)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Daftar mata kuliah yang terdaftar pada semester ini</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Disetujui Dosen PA
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">Kode</th>
                <th className="py-3 px-3">Nama Mata Kuliah</th>
                <th className="py-3 px-3 text-center">SKS</th>
                <th className="py-3 px-3">Deskripsi Singkat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course, idx) => (
                <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
                      {course.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{course.name}</td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-bold text-slate-700 px-2 py-0.5 rounded-md bg-slate-100">
                      {course.credits} SKS
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate">
                    {course.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-100 font-bold text-slate-800 text-xs">
                <td colSpan={3} className="py-4 px-3 text-right">
                  Total SKS:
                </td>
                <td className="py-4 px-3 text-center text-indigo-700">{summary.totalCredits} SKS</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
