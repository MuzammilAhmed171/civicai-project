import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FileText, MapPin, Building2, AlertCircle, CheckCircle2, Send, ArrowLeft, ShieldCheck, UploadCloud, Image as ImageIcon, X } from 'lucide-react';

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    province: user?.province || 'Sindh',
    city: user?.city || 'Karachi',
    addressLine1: '',
    addressLine2: '',
    description: '',
    category: 'Road'
  });

  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const provinces = [
    'Sindh',
    'Punjab',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Islamabad Capital Territory',
    'Azad Jammu & Kashmir',
    'Gilgit-Baltistan'
  ];

  const cityMap = {
    Sindh: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas', 'Nawabshah'],
    Punjab: ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha'],
    'Khyber Pakhtunkhwa': ['Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Kohat', 'Dera Ismail Khan'],
    Balochistan: ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Sibi'],
    'Islamabad Capital Territory': ['Islamabad'],
    'Azad Jammu & Kashmir': ['Muzaffarabad', 'Mirpur', 'Rawalakot'],
    'Gilgit-Baltistan': ['Gilgit', 'Skardu']
  };

  const categories = [
    { name: 'Road', label: 'Road & Potholes' },
    { name: 'Water', label: 'Water Supply & Pipelines' },
    { name: 'Waste', label: 'Sanitation & Solid Waste' },
    { name: 'Electricity', label: 'Electricity Wiring & Power' },
    { name: 'Drainage', label: 'Sewage & Gutter Overflow' },
    { name: 'Safety', label: 'Public Safety & Hazards' },
    { name: 'Other', label: 'General Civic Issue' }
  ];

  const handleProvinceChange = (e) => {
    const p = e.target.value;
    const defaultCity = cityMap[p]?.[0] || 'Karachi';
    setFormData({ ...formData, province: p, city: defaultCity });
  };

  // Image Processing & Compression Handler
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.addressLine1.trim()) {
      setError('Please provide a detailed description and specific Address Line 1.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const fullLocation = `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}, ${formData.city}, ${formData.province}`;

      await api.post('/complaints', {
        province: formData.province,
        city: formData.city,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        location: fullLocation,
        description: formData.description,
        category: formData.category,
        imageUrl: imagePreview
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-[#064e3b] text-white p-6 sm:p-8 border-b-4 border-emerald-400">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 mb-2">
            <ShieldCheck size={16} /> Official Public Grievance Submission Form
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Report a Municipal Issue
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Logged grievances route directly to designated municipal officers for district inspection.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white border-2 border-emerald-600 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase">Complaint Successfully Filed</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your grievance and photo evidence have been registered into the municipal database. Department officers will inspect the area.
            </p>

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setImagePreview('');
                  setFormData({ ...formData, description: '', addressLine1: '', addressLine2: '' });
                }}
                className="bg-[#064e3b] text-white px-6 py-2.5 text-xs font-bold uppercase border border-emerald-500"
              >
                Submit Another Complaint
              </button>
              {isAuthenticated ? (
                <Link to="/citizen/dashboard" className="bg-emerald-400 text-slate-950 px-6 py-2.5 text-xs font-extrabold uppercase border border-slate-900">
                  View My Portal
                </Link>
              ) : (
                <Link to="/login" className="bg-slate-800 text-white px-6 py-2.5 text-xs font-bold uppercase border border-slate-600">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-300 p-6 sm:p-8 space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500 text-rose-700 p-3.5 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category Selector */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Select Issue Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                >
                  {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.label}</option>)}
                </select>
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Province */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Province / Territory</label>
                  <select
                    value={formData.province}
                    onChange={handleProvinceChange}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase block mb-1">City / District</label>
                  <select
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    {(cityMap[formData.province] || ['Karachi']).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Address Line 1 (Street, Block, Landmark)</label>
                <input
                  type="text"
                  placeholder="e.g. Shahrah-e-Faisal, Block 6, Near Nursery Stop"
                  value={formData.addressLine1}
                  onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Address Line 2 (Optional Details)</label>
                <input
                  type="text"
                  placeholder="e.g. Opposite Habib Bank Building, Sector B"
                  value={formData.addressLine2}
                  onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase block mb-1">Detailed Description of Complaint</label>
                <textarea
                  rows={4}
                  placeholder="Describe the issue clearly (e.g. Main water pipeline burst causing road overflow and low household supply pressure...)"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-3 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* Optional Drag & Drop Photo Upload Zone */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase block mb-1">
                  Complaint Photo Evidence (Optional)
                </label>

                {imagePreview ? (
                  <div className="bg-slate-50 border-2 border-emerald-600 p-3 relative space-y-2">
                    <div className="h-48 overflow-hidden border border-slate-300 bg-slate-900 flex items-center justify-center">
                      <img src={imagePreview} alt="Complaint Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-emerald-800 font-bold font-mono">Photo Attached for Field Inspection</span>
                      <button
                        type="button"
                        onClick={() => setImagePreview('')}
                        className="bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold px-3 py-1 uppercase flex items-center gap-1 border border-rose-500"
                      >
                        <X size={14} /> Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed p-6 text-center transition-all cursor-pointer relative ${isDragging
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-emerald-500'
                      }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="space-y-2 pointer-events-none">
                      <div className="w-12 h-12 bg-[#064e3b] text-white flex items-center justify-center mx-auto">
                        <UploadCloud size={24} />
                      </div>
                      <div className="text-xs font-bold text-slate-800 uppercase">
                        Drag & Drop Complaint Photo Here, or <span className="text-emerald-700 underline">Browse Local Storage</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Supports PNG, JPG, WEBP from Desktop or Mobile Drive
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#064e3b] hover:bg-[#00401a] text-white font-extrabold py-3.5 text-xs uppercase tracking-wider border-2 border-emerald-400 flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? 'Registering Grievance...' : <><Send size={16} /> Submit Grievance to Municipal Portal</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitComplaint;
