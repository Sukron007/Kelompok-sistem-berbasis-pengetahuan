import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  CreditCard,
  Banknote,
  Megaphone,
  History,
  X,
  Shield,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Kelola Mahasiswa', icon: Users },
    { to: '/admin/courses', label: 'Mata Kuliah', icon: BookOpen },
    { to: '/admin/schedules', label: 'Jadwal Kuliah', icon: CalendarDays },
    { to: '/admin/bills', label: 'Penerbitan SPP', icon: CreditCard },
    { to: '/admin/payments', label: 'Monitoring Pembayaran', icon: Banknote },
    { to: '/admin/notifications', label: 'Pengumuman & Notif', icon: Megaphone },
    { to: '/admin/audit-logs', label: 'Log Audit Sistem', icon: History },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-2 py-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-md">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 leading-tight tracking-tight">SIAKAD Admin</h1>
              <p className="text-[11px] font-medium text-slate-400">Portal Pengelola Akademik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg lg:hidden"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-amber-900">
        <p className="text-xs font-semibold mb-1">Mode Administrator</p>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Tindakan finansial diaudit secara ketat. Penghapusan data mahasiswa dengan riwayat SPP dicegah otomatis.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40 bg-white border-r border-slate-200">
        {sidebarContent}
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
