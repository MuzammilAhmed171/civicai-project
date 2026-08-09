import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Lock, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck, KeyRound, User } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const navigate = useNavigate();
  const { login, adminLogin } = useAuth();

  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' | 'admin'

  // Citizen Login State
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');

  // Admin Login State
  const [adminUsername, setAdminUsername] = useState('admin@civicai.gov');
  const [adminPassword, setAdminPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCitizenSubmit = async (e) => {
    e.preventDefault();
    if (!identity || !password) {
      setError('Please enter your CNIC / Email and Password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(identity, password);
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid CNIC/Email or Password');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) {
      setError('Please enter admin email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await adminLogin(adminUsername, adminPassword);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid Municipal Admin Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-300 max-w-md w-full shadow-md text-slate-900 space-y-4">
        {/* Government Header */}
        <div className="bg-[#064e3b] text-white p-5 text-center border-b-2 border-emerald-400 space-y-2">
          <div className="flex justify-center">
            <Logo light={true} />
          </div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-200">
            Official Municipal Grievance Portal Access
          </div>
        </div>

        {/* Portal Tab Selector */}
        <div className="grid grid-cols-2 p-2 gap-1 bg-slate-200 border-b border-slate-300 font-bold text-xs uppercase tracking-wider">
          <button
            type="button"
            onClick={() => { setActiveTab('citizen'); setError(''); }}
            className={`py-2.5 flex items-center justify-center gap-1.5 border transition-all ${
              activeTab === 'citizen'
                ? 'bg-[#064e3b] text-white border-emerald-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <User size={15} /> Citizen Portal
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setError(''); }}
            className={`py-2.5 flex items-center justify-center gap-1.5 border transition-all ${
              activeTab === 'admin'
                ? 'bg-[#064e3b] text-white border-emerald-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck size={15} /> Municipal Admin
          </button>
        </div>

        <div className="p-6 pt-2 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-400 text-rose-800 p-3 text-xs flex items-center gap-2 font-semibold">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: CITIZEN LOGIN */}
          {activeTab === 'citizen' ? (
            <form onSubmit={handleCitizenSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase block mb-1">CNIC Number or Email</label>
                <input
                  type="text"
                  placeholder="e.g. 42101-1234567-1 or tariq@example.com"
                  value={identity}
                  onChange={e => setIdentity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Account Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 pl-3 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#064e3b] hover:bg-[#00401a] text-white font-extrabold py-3 text-xs uppercase tracking-wider border border-emerald-500 flex items-center justify-center gap-2 transition-all mt-2"
              >
                {loading ? 'Authenticating...' : <>Sign In to Portal <ArrowRight size={16} /></>}
              </button>

              <div className="text-center pt-3 border-t border-slate-200 text-xs text-slate-600">
                Don't have a citizen account?{' '}
                <Link to="/register" className="text-[#064e3b] font-bold hover:underline">
                  Register CNIC Account
                </Link>
              </div>
            </form>
          ) : (
            /* TAB 2: MUNICIPAL ADMIN LOGIN */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-300 p-2.5 text-[11px] text-emerald-900 font-mono">
                Official Government Access Credentials:
                <br />Email: <strong>admin@civicai.gov</strong> | Pass: <strong>admin123</strong>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Admin Officer Email</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Admin Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 pl-3 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#064e3b] hover:bg-[#00401a] text-white font-extrabold py-3 text-xs uppercase tracking-wider border border-emerald-500 flex items-center justify-center gap-2 transition-all mt-2"
              >
                {loading ? 'Authenticating Admin...' : <>Unlock Municipal Control Panel <ArrowRight size={16} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
