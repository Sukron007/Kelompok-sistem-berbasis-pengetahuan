import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../../services/adminService.ts';
import { Payment } from '../../../types/index.ts';
import { LoadingSpinner } from '../../../components/Loading/LoadingSpinner.tsx';
import { StatusBadge } from '../../../components/Badge/StatusBadge.tsx';
import { getApiErrorMessage } from '../../../services/api.ts';
import { Banknote, Search, Receipt, ShieldCheck } from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPayments({ search, status: statusFilter || undefined });
      setPayments(res.items);
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Monitoring Pembayaran SPP</h1>
          <p className="text-xs text-slate-500 mt-1">
            Data transaksi real-time terintegrasi webhook Midtrans Gateway & audit trail
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-semibold self-start">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Midtrans Webhook Idempotency Active</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari order_id, transaction_id, atau nama mahasiswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPayments()}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Semua Status Transaksi</option>
          <option value="settlement">Settlement / Lunas</option>
          <option value="pending">Pending</option>
          <option value="expire">Expire</option>
          <option value="cancel">Cancel</option>
          <option value="failure">Failure</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        {loading ? (
          <LoadingSpinner message="Memuat riwayat transaksi pembayaran..." />
        ) : payments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Tidak ada data transaksi pembayaran yang cocok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Order ID / Waktu</th>
                  <th className="py-3 px-3">Mahasiswa</th>
                  <th className="py-3 px-3">Tagihan</th>
                  <th className="py-3 px-3">Nominal</th>
                  <th className="py-3 px-3">Kanal</th>
                  <th className="py-3 px-3">Status Transaksi</th>
                  <th className="py-3 px-3 text-right">Kwitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-mono font-bold text-slate-900">{p.order_id}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(p.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{p.student?.full_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        NIM: {p.student?.student_number}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      SPP Smstr {p.bill?.semester}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      Rp {p.gross_amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-3 uppercase text-slate-600">
                      {p.payment_type || 'snap'}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={p.transaction_status} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {p.receipt ? (
                        <Link
                          to={`/payments/${p.id}/receipt`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>{p.receipt.receipt_number}</span>
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
