import React, { useState, useEffect } from 'react';
import { academicService } from '../../../services/academicService.ts';
import { CourseSchedule } from '../../../types/index.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import { Calendar, Clock, MapPin, User, Search, Filter } from 'lucide-react';

export const SchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('SEMUA');
  const [search, setSearch] = useState('');

  const days = ['SEMUA', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const dayParam = selectedDay === 'SEMUA' ? undefined : selectedDay;
        const res = await academicService.getSchedules(dayParam);
        setSchedules(res);
      } catch (err: any) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [selectedDay]);

  const filtered = schedules.filter((s) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      s.course?.name.toLowerCase().includes(term) ||
      s.lecturer_name.toLowerCase().includes(term) ||
      s.room.toLowerCase().includes(term) ||
      s.class_name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jadwal Kuliah</h1>
          <p className="text-xs text-slate-500 mt-1">
            Waktu tatap muka, ruang kuliah, dan dosen pengampu semester ini
          </p>
        </div>

        {/* Day Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDay === day
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari mata kuliah, dosen, atau ruang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 shadow-2xs"
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Memuat jadwal kuliah..." />
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-center text-xs">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200/80 text-center">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Tidak ada jadwal kuliah ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Coba pilih hari lain atau sesuaikan kata kunci pencarian</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                    {item.day_of_week}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Kelas {item.class_name}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                  {item.course?.name || 'Mata Kuliah'}
                </h3>
                <p className="text-xs text-slate-400 font-mono mb-4">{item.course?.code} • {item.course?.credits} SKS</p>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-medium text-slate-800">
                      {item.start_time} - {item.end_time} WIB
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Ruang: <strong className="text-slate-800 font-semibold">{item.room}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.lecturer_name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
