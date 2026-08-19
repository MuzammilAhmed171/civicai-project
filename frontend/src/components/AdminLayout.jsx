import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, BarChart3, ShieldCheck, LogOut, User, CopyCheck, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const AdminLayout = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLogoutModal]);

  // Redirect if not authenticated as admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { to: '/admin', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'Complaints Management', icon: FileSpreadsheet },
    { to: '/admin/duplicates', label: 'Duplicate Grievances', icon: CopyCheck },
    { to: '/admin/reports', label: 'Official Reports Export', icon: FileText },
    { to: '/admin/analytics', label: 'City & Province Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Emerald Green Admin Bar */}
      <header className="bg-[#064e3b] text-white border-b-2 border-emerald-400 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Logo light={true} />
          <span className="hidden sm:inline-block bg-[#00401a] border border-emerald-400 text-emerald-200 px-3 py-1 text-xs font-mono font-bold uppercase">
            Official Municipal Control Panel
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-[#00401a] border border-emerald-500/40 px-3 py-1 text-xs">
            <User size={14} className="text-emerald-300" />
            <div>
              <span className="font-bold text-white block">{user?.name || 'Chief Inspector'}</span>
              <span className="text-[10px] text-emerald-300 font-mono block">{user?.email || 'admin@civicai.gov'}</span>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white px-3.5 py-1.5 text-xs font-extrabold uppercase border border-rose-500 transition-all shadow-sm"
          >
            <LogOut size={15} /> Lock & Logout
          </button>
        </div>
      </header>

      {/* Main Admin Sidebar + Content Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-300 p-4 shrink-0 space-y-4">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 px-2 pb-2 border-b border-slate-200">
            Municipal Inspector Tabs
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider border transition-all ${
                    active
                      ? 'bg-[#064e3b] text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-200 border-slate-200'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 space-y-1 px-2">
            <div className="font-bold text-slate-700">Govt. Redressal System</div>
            <div>Department Dispatch Active</div>
            <div className="font-mono text-[10px] text-emerald-700">Protected Auth Session</div>
          </div>
        </aside>

        {/* Main Content View */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Admin Session Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border-4 border-[#064e3b] max-w-md w-full p-6 space-y-4 shadow-2xl animate-modal-pop">
            <div className="flex items-center gap-3 border-b-2 border-slate-200 pb-3">
              <div className="w-10 h-10 bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-300 shrink-0">
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-slate-900">Lock Executive Control Panel?</h3>
                <p className="text-xs text-emerald-800 font-mono font-bold">Government Officer Session</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 border border-slate-200">
              Are you sure you want to end your active administrative session? You will be safely logged out of municipal control panel tools.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase px-4 py-2 border border-slate-400"
              >
                Cancel Session Lock
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-extrabold uppercase px-5 py-2 border border-rose-500 shadow-sm"
              >
                Confirm & Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
