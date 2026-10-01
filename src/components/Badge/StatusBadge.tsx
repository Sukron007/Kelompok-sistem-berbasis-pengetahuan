import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'PAID':
      case 'SETTLEMENT':
      case 'CAPTURE':
      case 'DINILAI':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
      case 'DIKERJAKAN':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'UNPAID':
      case 'BELUM_DIKERJAKAN':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'DIKUMPULKAN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TERLAMBAT':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'EXPIRED':
      case 'CANCEL':
      case 'FAILURE':
      case 'DENY':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getLabel = () => {
    switch (normalized) {
      case 'PAID':
      case 'SETTLEMENT':
      case 'CAPTURE':
        return 'Lunas';
      case 'PENDING':
        return 'Menunggu';
      case 'UNPAID':
        return 'Belum Bayar';
      case 'EXPIRED':
        return 'Kedaluwarsa';
      case 'FAILED':
      case 'FAILURE':
      case 'DENY':
        return 'Gagal';
      case 'CANCEL':
        return 'Dibatalkan';
      case 'BELUM_DIKERJAKAN':
        return 'Belum Dikerjakan';
      case 'DIKERJAKAN':
        return 'Sedang Dikerjakan';
      case 'DIKUMPULKAN':
        return 'Terkumpul';
      case 'TERLAMBAT':
        return 'Terlambat';
      case 'DINILAI':
        return 'Sudah Dinilai';
      default:
        return status;
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border font-semibold ${getStyle()} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {getLabel()}
    </span>
  );
};
