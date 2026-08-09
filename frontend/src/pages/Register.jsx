import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, CreditCard, Mail, Phone, MapPin, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    email: '',
    phone: '',
    city: 'Karachi',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Sukkur'];

  const formatCNIC = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  const handleCNICChange = (e) => {
    setFormData({ ...formData, cnic: formatCNIC(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.cnic || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill all required fields');
      return;
    }

    if (formData.cnic.length !== 15) {
      setError('Please enter a valid 13-digit CNIC format (12345-6789012-3)');
      return;
    }

    const phoneRegex = /^(\+92|0|92)?-?3\d{2}-?\d{7}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid Pakistani phone number (e.g. 0300-1234567 or +92-300-1234567)');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-300 p-6 sm:p-8 max-w-lg w-full shadow-md text-slate-900 space-y-5">
        {/* Header */}
        <div className="bg-[#064e3b] text-white p-4 text-center border-b-2 border-emerald-400">
          <div className="w-10 h-10 bg-[#00401a] text-emerald-300 border border-emerald-400 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck size={22} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Citizen CNIC Registration</h2>
          <p className="text-[11px] text-emerald-100 mt-0.5">Register CNIC to submit & track public grievances</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-400 text-rose-800 p-3 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Muhammad Tariq"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
          </div>

          {/* CNIC Number */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase block mb-1">CNIC (National Identity Card)</label>
            <div className="relative">
              <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="42101-1234567-1"
                value={formData.cnic}
                onChange={handleCNICChange}
                className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                maxLength={15}
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Format: 13 digits with dashes (e.g. 42101-1234567-1)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="tariq@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Mobile Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* City */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Registered City</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                >
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 pl-9 pr-9 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#064e3b] hover:bg-[#00401a] text-white font-extrabold py-3 text-xs uppercase tracking-wider border border-emerald-500 flex items-center justify-center gap-2 transition-all mt-2"
          >
            {loading ? 'Registering Account...' : <>Complete CNIC Signup <ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-slate-200 text-xs text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="text-[#064e3b] font-bold hover:underline">
            Citizen Login Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
