import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, User, LogOut, LogIn, UserPlus, Menu, X, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-[#064e3b] text-white border-b-2 border-emerald-400 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo with Pakistani Crest */}
          <Link to="/" className="flex items-center">
            <Logo light={true} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Always visible: Home */}
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border ${location.pathname === '/' ? 'bg-[#006600] border-emerald-300 text-white' : 'border-transparent text-emerald-100 hover:bg-[#006600]/60'
                }`}
            >
              <Home size={16} /> Home
            </Link>

            {/* If Authenticated as Citizen */}
            {isAuthenticated && !isAdmin && (
              <>
                <Link
                  to="/submit"
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border ${location.pathname === '/submit' ? 'bg-[#006600] border-emerald-300 text-white' : 'border-transparent text-emerald-100 hover:bg-[#006600]/60'
                    }`}
                >
                  <FileText size={16} /> Submit Complaint
                </Link>

                <Link
                  to="/citizen/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border ${location.pathname.startsWith('/citizen') ? 'bg-[#006600] border-emerald-300 text-white' : 'border-transparent text-emerald-100 hover:bg-[#006600]/60'
                    }`}
                >
                  <User size={16} /> My Portal
                </Link>
              </>
            )}

            {/* Auth Buttons */}
            <div className="ml-4 pl-4 border-l border-emerald-800 flex items-center gap-2">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="bg-[#00401a] border border-emerald-500/40 px-3 py-1.5 text-xs text-left">
                    <div className="font-bold text-white flex items-center gap-1">
                      <User size={13} className="text-emerald-300" /> {user?.name || 'Citizen'}
                    </div>
                    <div className="text-[10px] text-emerald-300 font-mono">{user?.cnic || 'CNIC Logged'}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold uppercase tracking-wider border border-rose-500 transition-all"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 bg-[#00401a] hover:bg-[#006600] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider border border-emerald-400 transition-all"
                  >
                    <LogIn size={15} />Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-900 px-4 py-2 text-xs font-extrabold uppercase tracking-wider border border-white transition-all shadow-sm"
                  >
                    <UserPlus size={15} /> Register CNIC
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-white border border-emerald-500" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#064e3b] border-t border-emerald-700 p-3 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 bg-[#00401a] text-xs font-bold uppercase tracking-wider text-white border border-emerald-600" onClick={() => setMobileOpen(false)}>
            <Home size={18} /> Home
          </Link>

          {isAuthenticated && !isAdmin && (
            <>
              <Link to="/submit" className="flex items-center gap-3 px-4 py-2.5 bg-[#00401a] text-xs font-bold uppercase tracking-wider text-white border border-emerald-600" onClick={() => setMobileOpen(false)}>
                <FileText size={18} /> Submit Complaint
              </Link>
              <Link to="/citizen/dashboard" className="flex items-center gap-3 px-4 py-2.5 bg-[#00401a] text-xs font-bold uppercase tracking-wider text-white border border-emerald-600" onClick={() => setMobileOpen(false)}>
                <User size={18} /> My Portal
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-emerald-700 space-y-2">
            {isAuthenticated ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center justify-center gap-2 bg-rose-700 text-white px-4 py-2.5 text-xs font-bold uppercase w-full border border-rose-500">
                <LogOut size={18} /> Logout ({user?.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" className="flex items-center justify-center gap-1.5 bg-[#00401a] text-white px-3 py-2 text-xs font-bold uppercase border border-emerald-400" onClick={() => setMobileOpen(false)}>
                  <LogIn size={16} /> Login
                </Link>
                <Link to="/register" className="flex items-center justify-center gap-1.5 bg-emerald-400 text-slate-900 px-3 py-2 text-xs font-extrabold uppercase border border-white" onClick={() => setMobileOpen(false)}>
                  <UserPlus size={16} /> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
