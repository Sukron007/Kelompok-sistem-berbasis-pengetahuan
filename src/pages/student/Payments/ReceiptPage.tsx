import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { paymentService } from '../../../services/paymentService.ts';
import { Payment } from '../../../types/index.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

export const ReceiptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await paymentService.getPaymentById(id);
        setPayment(data);
      } catch (err: any) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Menyiapkan kwitansi pembayaran resmi..." />;
  }

  if (error || !payment) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-600 text-sm">{error || 'Data pembayaran tidak ditemukan.'}</p>
        <Link to="/payments" className="text-indigo-600 text-xs font-semibold mt-2 inline-block">
          Kembali ke Riwayat Pembayaran
        </Link>
      </div>
    );
  }

  const receipt = payment.receipt;
  const student = payment.student;
  const bill = payment.bill;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Action Bar (hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/payments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Riwayat Pembayaran
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Cetak Kwitansi Resmi (PDF)
        </button>
      </div>

      {/* Official Receipt Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl relative overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Paid Watermark stamp */}
        <div className="absolute right-6 top-28 -rotate-12 select-none opacity-10 pointer-events-none">
          <div className="border-8 border-emerald-600 rounded-3xl px-8 py-4 font-black text-6xl text-emerald-600 uppercase tracking-widest">
            LUNAS
          </div>
        </div>

        {/* University Header */}
        <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
              SP
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-tight">
                UNIVERSITAS TEKNOLOGI SIAKAD
              </h1>
              <p className="text-[11px] text-slate-500">
                Biro Administrasi Keuangan & Akademik • Terakreditasi Unggul
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> RESMI & SAH
            </span>
          </div>
        </div>

        {/* Receipt Title & Meta */}
        <div className="text-center my-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
            Kwitansi Bukti Pembayaran SPP
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Nomor: <strong className="text-slate-800">{receipt?.receipt_number || `RCP-${payment.order_id}`}</strong>
          </p>
        </div>

        {/* Student and Payment Details Grid */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-slate-400 font-medium">Nama Mahasiswa</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{student?.full_name || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Nomor Induk Mahasiswa (NIM)</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{student?.student_number || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Program Studi / Fakultas</p>
              <p className="font-semibold text-slate-700 mt-0.5">
                {student?.study_program || '-'} / {student?.faculty || '-'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Semester / Tahun Akademik</p>
              <p className="font-semibold text-slate-700 mt-0.5">
                Semester {bill?.semester || '-'} ({bill?.academic_year?.name || '-'})
              </p>
            </div>
          </div>

          {/* Payment Gateway Specifics */}
          <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">Uraian Pembayaran:</span>
              <span className="font-semibold text-slate-800">
                {bill?.description || `SPP Kuliah Semester ${bill?.semester}`}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">Order ID (Midtrans):</span>
              <span className="font-mono font-medium text-slate-700">{payment.order_id}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">ID Transaksi Gateway:</span>
              <span className="font-mono font-medium text-slate-700">{payment.transaction_id || '-'}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">Kanal Pembayaran:</span>
              <span className="font-semibold text-slate-800 uppercase">
                {payment.payment_type || 'Midtrans Snap'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">Waktu Penyelesaian:</span>
              <span className="font-medium text-slate-800">
                {new Date(payment.settlement_time || payment.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}{' '}
                WIB
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 text-sm">
              <span className="font-bold text-slate-900">Total Nominal Pembayaran:</span>
              <span className="font-black text-xl text-emerald-700">
                Rp {payment.gross_amount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Verification and Sign-off */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-end justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
              <QrCode className="w-12 h-12 text-slate-700" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Verifikasi Dokumen Digital</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Kwitansi ini diterbitkan sah secara elektronik oleh sistem SIAKAD Pro & Midtrans Gateway.
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-slate-400 text-[11px]">Biro Keuangan,</p>
            <div className="h-10"></div>
            <p className="font-bold text-slate-900">Dr. Ir. Hendra Gunawan, M.T.</p>
            <p className="text-[10px] text-slate-500">NIP. 19800512 200501 1 002</p>
          </div>
        </div>
      </div>
    </div>
  );
};
