import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { adminLogin } = useAuth();

  const urlKey = searchParams.get('key');
  const isKeyValid = urlKey === 'civic2026';

  const [username, setUsername] = useState('admin@civicai.gov');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState(urlKey || '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (secretKey !== 'civic2026') {
      setError('Invalid or missing Secret Security Access Key.');
      return;
    }

    if (!username || !password) {
      setError('Please enter admin email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await adminLogin(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Unauthorized access. Invalid admin password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-300 p-6 sm:p-8 max-w-md w-full shadow-md text-slate-900 space-y-5">
        {/* Header */}
        <div className="bg-[#064e3b] text-white p-4 text-center border-b-2 border-emerald-400 space-y-2">
          <div className="flex justify-center">
            <Logo light={true} />
          </div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
            Municipal Authority Administration Portal
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-400 text-rose-800 p-3 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Secret Access Key */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Secret Access Key</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Enter key (e.g. civic2026)"
                value={secretKey}
                onChange={e => setSecretKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Key required for authorized municipal officers</p>
          </div>

          {/* Admin Email */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Admin Officer Username / Email</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
          </div>

          {/* Admin Password */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Admin Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 pl-9 pr-9 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
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
            {loading ? 'Verifying Admin Credentials...' : <>Authenticate & Open Control Panel <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
