import React, { useState, useEffect, useRef } from 'react';
import { studentService } from '../../../services/studentService.ts';
import { StudentProfile } from '../../../types/index.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import {
  User,
  Phone,
  MapPin,
  Mail,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Save,
  Camera,
  Upload,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.tsx';

export const ProfilePage: React.FC = () => {
  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await studentService.getProfile();
        setProfile(data);
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setPhotoUrl(data.photo_url || '');
      } catch (err: any) {
        setMessage({ type: 'error', text: getApiErrorMessage(err) });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Harap pilih file gambar (JPG, PNG, WebP).' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ukuran foto maksimal 5 MB.' });
        return;
      }

      try {
        setUploadingPhoto(true);
        setMessage(null);
        const updated = await studentService.uploadPhoto(file);
        setProfile(updated);
        setPhotoUrl(updated.photo_url || '');
        await refreshUser();
        setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
      } catch (err: any) {
        setMessage({ type: 'error', text: getApiErrorMessage(err) });
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const updated = await studentService.updateProfile({
        phone: phone.trim() || null,
        address: address.trim() || null,
        photo_url: photoUrl.trim() || null,
      });
      setProfile(updated);
      await refreshUser();
      setMessage({ type: 'success', text: 'Profil kontak berhasil diperbarui!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Memuat profil mahasiswa..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil Mahasiswa</h1>
        <p className="text-xs text-slate-500 mt-1">
          Informasi identitas akademik, foto profil, dan data kontak mahasiswa
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

      {/* Profile Overview Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-28 h-28 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-bold text-3xl overflow-hidden shadow-lg shadow-indigo-100 relative">
            {photoUrl ? (
              <img src={photoUrl} alt="Student avatar" className="w-full h-full object-cover" />
            ) : (
              profile?.full_name?.slice(0, 2) || 'MA'
            )}

            {/* Uploading state overlay */}
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white text-xs">
                <Loader2 className="w-6 h-6 animate-spin mb-1" />
                <span>Upload...</span>
              </div>
            )}
          </div>

          {/* Change Avatar Button Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md border-2 border-white transition-all cursor-pointer hover:scale-105"
            title="Ganti Foto Profil"
          >
            <Camera className="w-4 h-4" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileSelect}
          />
        </div>

        <div className="text-center sm:text-left space-y-1 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900">{profile?.full_name}</h2>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              Semester {profile?.semester}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Nomor Induk Mahasiswa (NIM):{' '}
            <strong className="text-slate-800 font-mono font-semibold">
              {profile?.student_number}
            </strong>
          </p>
          <p className="text-xs text-slate-600 font-medium">
            {profile?.study_program || 'Teknik Informatika'} • {profile?.faculty || 'Fakultas Teknologi Informasi'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Ganti Foto Profil
            </button>
          </div>
        </div>
      </div>

      {/* Details & Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Academic Record (Read-only) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <h3>Identitas Terdaftar</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Fakultas</p>
              <p className="font-semibold text-slate-800 mt-0.5">{profile?.faculty || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Program Studi</p>
              <p className="font-semibold text-slate-800 mt-0.5">{profile?.study_program || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Tahun Akademik Masuk</p>
              <p className="font-semibold text-slate-800 mt-0.5">{profile?.academic_year || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Status Akademik</p>
              <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                AKTIF BERKULIAH
              </span>
            </div>
          </div>
        </div>

        {/* Right: Contact Information (Editable) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm pb-4 border-b border-slate-100 mb-6">
            <User className="w-4 h-4 text-indigo-600" />
            <h3>Ubah Data Kontak & Foto</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor Telepon / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="+62 812 3456 7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Domisili
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  rows={3}
                  placeholder="Jl. Kampus Merdeka No. 45, Jakarta"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                URL Foto Profil (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Atau unggah langsung file gambar foto resmi Anda menggunakan tombol di bagian atas
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
