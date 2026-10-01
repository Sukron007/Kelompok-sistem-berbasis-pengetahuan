import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { academicService } from '../../../services/academicService.ts';
import { Course } from '../../../types/index.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import { BookOpen, Clock, MapPin, User, ArrowRight, Search, FileText } from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await academicService.getCourses(search);
        setCourses(res);
      } catch (err: any) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await academicService.getCourses(search);
      setCourses(res);
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mata Kuliah & Kurikulum</h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar mata kuliah terdaftar, capaian pembelajaran, silabus, dan jadwal perkuliahan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
            {courses.length} Mata Kuliah • {totalCredits} SKS Total
          </span>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex items-center gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau nama mata kuliah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 shadow-2xs"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold shadow-xs"
        >
          Cari
        </button>
      </form>

      {loading ? (
        <LoadingSpinner message="Memuat kurikulum mata kuliah..." />
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs text-center">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200/80 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Tidak ada mata kuliah ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {course.code}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {course.credits} SKS
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2">{course.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                  {course.description || 'Deskripsi kurikulum dan kompetensi capaian pembelajaran.'}
                </p>

                {/* Schedules preview if any */}
                {course.schedules && course.schedules.length > 0 && (
                  <div className="space-y-1.5 border-t border-slate-100 pt-3 mb-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Jadwal Kelas
                    </p>
                    {course.schedules.map((sch) => (
                      <div
                        key={sch.id}
                        className="text-xs text-slate-600 flex items-center justify-between p-2 rounded-xl bg-slate-50"
                      >
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>
                            {sch.day_of_week} ({sch.start_time} - {sch.end_time})
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">{sch.room}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/assignments?course_id=${course.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lihat Tugas Terkait</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  TERDAFTAR
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
