import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { billService } from '../../../services/billService.ts';
import { paymentService, PaymentCreationResult } from '../../../services/paymentService.ts';
import { Bill, Payment } from '../../../types/index.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { StatusBadge } from '../../../components/Badge/StatusBadge.tsx';
import { Modal } from '../../../components/Modal/Modal.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import {
  CreditCard,
  ShieldCheck,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  QrCode,
  Building,
  Smartphone,
  Copy,
  Check,
  HelpCircle,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [history, setHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'all' | 'bni' | 'mandiri' | 'seabank' | 'bsi' | 'qris'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [simulatingOrderId, setSimulatingOrderId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Active Checkout Modal / Details
  const [activeCheckout, setActiveCheckout] = useState<{
    bill: Bill;
    result: PaymentCreationResult;
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsData, historyData] = await Promise.all([
        billService.getStudentBills(),
        paymentService.getHistory(),
      ]);
      setBills(billsData);
      setHistory(historyData);
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayNow = async (bill: Bill, methodOverride?: 'all' | 'bni' | 'mandiri' | 'seabank' | 'bsi' | 'qris') => {
    const method = methodOverride || selectedMethod;
    try {
      setPayingBillId(bill.id);
      setMessage(null);
      const res = await paymentService.createPayment(bill.id, method);

      // Open checkout detail modal if instructions exist
      if (res.payment_instructions) {
        setActiveCheckout({ bill, result: res });
      }

      // Trigger Midtrans Snap Popup directly
      paymentService.openSnapPopup(res.snap_token, {
        onSuccess: async () => {
          setActiveCheckout(null);
          setMessage({
            type: 'success',
            text: 'Pembayaran berhasil dikonfirmasi! Kwitansi resmi telah diterbitkan.',
          });
          await fetchData();
        },
        onPending: async () => {
          setMessage({
            type: 'info',
            text: 'Transaksi pending dibuat. Silakan selesaikan pembayaran sesuai petunjuk metode yang dipilih.',
          });
          await fetchData();
        },
        onError: () => {
          setMessage({
            type: 'error',
            text: 'Pembayaran gagal atau dibatalkan oleh pengguna.',
          });
          fetchData();
        },
        onClose: () => {
          fetchData();
        },
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setPayingBillId(null);
    }
  };

  const handleCopyVa = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  /**
   * Simulate Sandbox Webhook callback (Dev convenience for Midtrans Sandbox)
   */
  const handleSimulateSandbox = async (orderId: string) => {
    try {
      setSimulatingOrderId(orderId);
      await paymentService.simulateSandboxStatus(orderId, 'settlement');
      setActiveCheckout(null);
      setMessage({
        type: 'success',
        text: `Webhook Midtrans (Settlement) berhasil diverifikasi untuk Order ${orderId}! Status SPP dan Kwitansi terverifikasi otomatis.`,
      });
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setSimulatingOrderId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Menghubungkan ke sistem tagihan & payment gateway..." />;
  }

  const activeBills = bills.filter((b) => b.status === 'UNPAID' || b.status === 'PENDING');

  const paymentChannels = [
    {
      id: 'all',
      name: 'Semua Metode',
      tag: 'Midtrans Snap',
      badge: 'Multi-Channel',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    },
    {
      id: 'bni',
      name: 'Bank BNI',
      tag: 'BNI Virtual Account',
      badge: 'Otomatis 24/7',
      color: 'bg-orange-50 border-orange-200 text-orange-700',
    },
    {
      id: 'mandiri',
      name: 'Bank Mandiri',
      tag: 'Livin\' / Mandiri Bill',
      badge: 'Kode: 88708',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
    },
    {
      id: 'seabank',
      name: 'SeaBank',
      tag: 'SeaBank App / VA',
      badge: 'Instan Bebas Biaya',
      color: 'bg-amber-50 border-amber-200 text-amber-700',
    },
    {
      id: 'bsi',
      name: 'Bank BSI',
      tag: 'BSI Syariah Virtual Account',
      badge: 'Syariah Online',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
    {
      id: 'qris',
      name: 'QRIS',
      tag: 'Scan Semua E-Wallet & Bank',
      badge: 'BCA, GoPay, OVO',
      color: 'bg-purple-50 border-purple-200 text-purple-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pembayaran SPP Mahasiswa</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pembayaran tagihan kuliah terintegrasi otomatis melalui Midtrans Snap (BNI, Mandiri, SeaBank, BSI, dan QRIS)
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Sinkronkan Status
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : message.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Select Preferred Payment Method */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Pilih Kanal Pembayaran Utama
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tersedia integrasi langsung untuk BNI, Mandiri, SeaBank, BSI, dan QRIS Nasional
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {paymentChannels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedMethod(ch.id as any)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedMethod === ch.id
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">{ch.name}</span>
                {selectedMethod === ch.id && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{ch.tag}</p>
              <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${ch.color}`}>
                {ch.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active SPP Bills Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Tagihan SPP Perlu Dibayar
        </h2>

        {activeBills.length === 0 ? (
          <div className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-center gap-4 text-emerald-900">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">Semua Tagihan SPP Telah Lunas!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Tidak ada tagihan tertunggak untuk semester ini. Anda dapat mencetak kwitansi di bawah.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeBills.map((bill) => {
              const isPending = bill.status === 'PENDING';

              return (
                <div
                  key={bill.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                        {bill.academic_year?.name || 'Tahun Akademik'}
                      </span>
                      <StatusBadge status={bill.status} size="md" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      SPP Semester {bill.semester}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{bill.description || 'Tagihan SPP Pokok'}</p>

                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Total Nominal Tagihan</p>
                      <p className="text-2xl font-black text-slate-900 mt-0.5">
                        Rp {bill.amount.toLocaleString('id-ID')}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Batas Waktu:{' '}
                        <strong className="text-slate-800 font-semibold">
                          {new Date(bill.due_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => handlePayNow(bill)}
                      disabled={payingBillId === bill.id}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {payingBillId === bill.id
                          ? 'Membuka Midtrans Snap...'
                          : isPending
                          ? `Lanjutkan Bayar via ${selectedMethod.toUpperCase()} (Pay Now)`
                          : `Bayar via ${selectedMethod === 'all' ? 'Midtrans' : selectedMethod.toUpperCase()} (Pay Now)`}
                      </span>
                    </button>

                    {/* Developer Sandbox helper if bill is pending */}
                    {isPending && bill.payments && bill.payments.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSimulateSandbox(bill.payments![0].order_id)}
                        disabled={simulatingOrderId === bill.payments![0].order_id}
                        className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-[11px] transition-colors"
                      >
                        {simulatingOrderId === bill.payments![0].order_id
                          ? 'Memproses Simulasi Webhook...'
                          : '⚡ Simulasikan Webhook Settlement (Sandbox)'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Channels Supported info banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" /> Kanal Pembayaran Terintegrasi Midtrans
        </div>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mb-4">
          Midtrans mendukung pembayaran instan multi-bank dan e-wallet 24/7 dengan verifikasi otomatis seketika tanpa perlu upload struk transfer fisik.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <Building className="w-5 h-5 text-orange-400" />
            <div>
              <p className="font-bold text-white">Bank BNI</p>
              <p className="text-[11px] text-slate-400">VA Billing BNI (988...)</p>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <Building className="w-5 h-5 text-blue-400" />
            <div>
              <p className="font-bold text-white">Bank Mandiri</p>
              <p className="text-[11px] text-slate-400">Livin' Multipayment (88708...)</p>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <Building className="w-5 h-5 text-amber-400" />
            <div>
              <p className="font-bold text-white">SeaBank</p>
              <p className="text-[11px] text-slate-400">VA SeaBank & QRIS Instant</p>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <Building className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="font-bold text-white">Bank BSI</p>
              <p className="text-[11px] text-slate-400">BSI Mobile & Syariah VA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Riwayat Transaksi Pembayaran SPP</h2>
            <p className="text-xs text-slate-500 mt-0.5">Daftar riwayat transaksi dan kwitansi resmi pembayaran</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {history.length} Transaksi
          </span>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Belum ada riwayat transaksi pembayaran SPP.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Deskripsi Tagihan</th>
                  <th className="py-3 px-3">Metode</th>
                  <th className="py-3 px-3">Nominal</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Kwitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((payment) => {
                  const isSettled =
                    payment.transaction_status === 'settlement' ||
                    payment.transaction_status === 'capture';

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        {new Date(payment.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-medium text-slate-700">
                        {payment.order_id}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        SPP Semester {payment.bill?.semester || '-'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 uppercase font-semibold">
                        {payment.payment_type || 'Midtrans'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        Rp {payment.gross_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={payment.transaction_status} size="sm" />
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {isSettled ? (
                          <Link
                            to={`/payments/${payment.id}/receipt`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Lihat Kwitansi</span>
                          </Link>
                        ) : payment.transaction_status === 'pending' ? (
                          <button
                            onClick={() => handleSimulateSandbox(payment.order_id)}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline"
                          >
                            Simulasikan Bayar
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Instructions Modal */}
      {activeCheckout && (
        <Modal
          isOpen={Boolean(activeCheckout)}
          onClose={() => setActiveCheckout(null)}
          title={`Instruksi Pembayaran ${activeCheckout.result.payment_instructions?.bank || 'Midtrans'}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <p className="text-slate-500">Nominal Transfer SPP:</p>
              <p className="text-2xl font-black text-indigo-900 mt-0.5">
                Rp {activeCheckout.result.amount.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-indigo-700 mt-1">
                Order ID: <span className="font-mono font-bold">{activeCheckout.result.order_id}</span>
              </p>
            </div>

            {activeCheckout.result.payment_instructions?.va_number && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Nomor Virtual Account ({activeCheckout.result.payment_instructions.bank}):
                  </p>
                  <p className="text-xl font-mono font-bold text-slate-900 mt-0.5 tracking-wider">
                    {activeCheckout.result.payment_instructions.va_number}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyVa(activeCheckout.result.payment_instructions!.va_number!)}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 font-semibold text-xs transition-colors"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Salin VA</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div>
              <p className="font-bold text-slate-800 mb-2">Panduan Langkah Pembayaran:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                {activeCheckout.result.payment_instructions?.steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleSimulateSandbox(activeCheckout.result.order_id)}
                className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold"
              >
                ⚡ Simulasikan Pelunasan Sandbox
              </button>
              <button
                type="button"
                onClick={() => {
                  paymentService.openSnapPopup(activeCheckout.result.snap_token, {
                    onSuccess: () => {
                      setActiveCheckout(null);
                      fetchData();
                    },
                    onClose: () => fetchData(),
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200"
              >
                Buka Popup Midtrans
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
