import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  FileText,
  CalendarDays,
  Bell,
  User,
  X,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Mata Kuliah', icon: BookOpen },
    { to: '/academic', label: 'Akademik', icon: GraduationCap },
    { to: '/payments', label: 'Pembayaran SPP', icon: CreditCard, highlight: true },
    { to: '/assignments', label: 'Tugas Kuliah', icon: FileText },
    { to: '/schedule', label: 'Jadwal Kuliah', icon: CalendarDays },
    { to: '/notifications', label: 'Notifikasi', icon: Bell },
    { to: '/profile', label: 'Profil Saya', icon: User },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-2 py-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-100">
              SP
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 leading-tight tracking-tight">SIAKAD Pro</h1>
              <p className="text-[11px] font-medium text-slate-400">Portal Akademik Mahasiswa</p>
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
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${item.highlight && !location.pathname.includes(item.to) ? 'text-indigo-600 font-semibold' : ''}`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    Midtrans
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 mt-6">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Midtrans Secured</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Sistem pembayaran SPP online otomatis terverifikasi langsung via Midtrans Gateway.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40 bg-white border-r border-slate-200">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer */}
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
