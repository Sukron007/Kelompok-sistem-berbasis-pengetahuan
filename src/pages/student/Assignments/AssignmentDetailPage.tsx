import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService.ts';
import { Assignment, AssignmentSubmission } from '../../../types/index.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { StatusBadge } from '../../../components/Badge/StatusBadge.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import {
  FileText,
  Upload,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileCheck,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

export const AssignmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAssignment = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await assignmentService.getAssignmentById(id);
      setAssignment(data);
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ukuran file melebihi 10MB.' });
        return;
      }
      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedFile) return;

    try {
      setSubmitting(true);
      setMessage(null);
      await assignmentService.submitAssignment(id, selectedFile);
      setMessage({ type: 'success', text: 'Tugas berhasil dikumpulkan ke server!' });
      setSelectedFile(null);
      await fetchAssignment();
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Memuat detail tugas perkuliahan..." />;
  }

  if (!assignment) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-600 text-sm">Tugas tidak ditemukan.</p>
        <Link to="/assignments" className="text-indigo-600 text-xs font-semibold mt-2 inline-block">
          Kembali ke Daftar Tugas
        </Link>
      </div>
    );
  }

  const submission: AssignmentSubmission | null =
    assignment.submissions && assignment.submissions.length > 0 ? assignment.submissions[0] : null;

  const isLate = new Date() > new Date(assignment.deadline);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Tugas
        </Link>
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
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Assignment Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {assignment.course?.name} ({assignment.course?.code})
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
              {assignment.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Batas Akhir:{' '}
                  <strong className={isLate ? 'text-rose-600' : 'text-slate-800'}>
                    {new Date(assignment.deadline).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <StatusBadge status={submission?.status || 'BELUM_DIKERJAKAN'} size="md" />
          </div>
        </div>

        {/* Description & Instructions */}
        <div className="py-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Deskripsi Tugas
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {assignment.description}
            </p>
          </div>

          {assignment.instructions && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 mb-1">Petunjuk Pengerjaan:</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {assignment.instructions}
              </p>
            </div>
          )}

          {assignment.attachment_url && (
            <div>
              <a
                href={assignment.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 p-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Buka Berkas Lampiran Materi / Referensi
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Grade and Feedback Box (if already graded) */}
      {submission && submission.score !== null && submission.score !== undefined && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h3 className="font-bold text-emerald-950 text-base flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" /> Hasil Penilaian Dosen
            </h3>
            <span className="text-2xl font-black text-emerald-700">{submission.score} / 100</span>
          </div>
          {submission.feedback && (
            <div className="mt-2 text-xs text-emerald-900 bg-white/80 p-4 rounded-2xl border border-emerald-100">
              <p className="font-semibold text-emerald-950 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Catatan Koreksi Dosen:
              </p>
              <p className="italic">{submission.feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Submission Upload Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {submission ? 'Perbarui Pengumpulan Tugas' : 'Unggah Jawaban Tugas'}
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Format berkas yang diperbolehkan: PDF, DOCX, ZIP, JPG, PNG (Maks 10MB).
        </p>

        {submission && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {submission.file_name || 'Berkas Tugas Tersimpan'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Dikumpulkan pada{' '}
                  {new Date(submission.submitted_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            {submission.file_url && (
              <a
                href={submission.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-indigo-600 hover:underline px-3 py-1.5 rounded-lg hover:bg-white"
              >
                Unduh Berkas
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <label className="cursor-pointer">
              <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Pilih file dari perangkat Anda
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.png"
                onChange={handleFileChange}
              />
            </label>
            <p className="text-[11px] text-slate-400 mt-1">atau seret file ke sini</p>

            {selectedFile && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !selectedFile}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Mengunggah Berkas...' : 'Kirim Jawaban Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
