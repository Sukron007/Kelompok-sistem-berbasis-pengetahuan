import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService.ts';
import { Assignment } from '../../../types/index.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { StatusBadge } from '../../../components/Badge/StatusBadge.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import { FileText, Calendar, ArrowRight, Search, CheckCircle2, Clock } from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNSUBMITTED' | 'SUBMITTED'>('ALL');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await assignmentService.getAssignments();
        setAssignments(data);
      } catch (err: any) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const filtered = assignments.filter((item) => {
    const isSubmitted =
      item.submissions &&
      item.submissions.length > 0 &&
      item.submissions[0].status !== 'BELUM_DIKERJAKAN';

    if (filterTab === 'UNSUBMITTED' && isSubmitted) return false;
    if (filterTab === 'SUBMITTED' && !isSubmitted) return false;

    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.course?.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tugas Perkuliahan</h1>
          <p className="text-xs text-slate-500 mt-1">
            Unggah berkas tugas dan pantau nilai feedback dari dosen
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterTab === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Tugas
          </button>
          <button
            onClick={() => setFilterTab('UNSUBMITTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterTab === 'UNSUBMITTED' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Belum Dikumpulkan
          </button>
          <button
            onClick={() => setFilterTab('SUBMITTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterTab === 'SUBMITTED' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selesai Dikirim
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari tugas atau mata kuliah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 shadow-2xs"
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Memuat daftar tugas..." />
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-center text-xs">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200/80 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Tidak ada tugas ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Semua tugas dalam kategori ini telah terselesaikan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const submission = item.submissions && item.submissions.length > 0 ? item.submissions[0] : null;
            const isLate = new Date() > new Date(item.deadline);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                      {item.course?.name || 'Mata Kuliah'}
                    </span>
                    <StatusBadge status={submission?.status || 'BELUM_DIKERJAKAN'} size="sm" />
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Tenggat:{' '}
                      <strong className={`font-semibold ${isLate && !submission ? 'text-rose-600' : 'text-slate-700'}`}>
                        {new Date(item.deadline).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </strong>
                    </span>
                  </div>

                  <Link
                    to={`/assignments/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 p-1"
                  >
                    <span>{submission ? 'Rincian Nilai' : 'Kirim Tugas'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
