import { useState, useEffect } from 'react';
import api from '../api/axios';
import { SkeletonGrid } from '../components/Loader';
import { CopyCheck, Loader2, AlertCircle, MapPin, Building2, Eye, CheckCircle2, User, CreditCard } from 'lucide-react';

const AdminDuplicates = () => {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const fetchDuplicates = async () => {
    try {
      const res = await api.get('/complaints/duplicates');
      setDuplicates(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch duplicate complaints:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-emerald-700 pb-3">
        <div>
          <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <CopyCheck size={24} className="text-[#064e3b]" /> Duplicate Grievance Detector
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Complaints automatically flagged for matching City, Category, and Location text
          </p>
        </div>
        <div className="bg-[#064e3b] text-white px-4 py-2 text-xs font-mono font-bold border border-emerald-500">
          Flagged Duplicates: {duplicates.length}
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={2} />
      ) : duplicates.length === 0 ? (
        <div className="bg-white p-12 text-center border-2 border-slate-300 space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-400">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 uppercase">No Duplicate Complaints Detected</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            All submitted grievances in the municipal database currently have distinct locations and descriptions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-400 text-amber-900 p-3 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-amber-700" />
            <span>Multiple citizens reporting grievances in the same area. Municipal officers can consolidate inspection field visits.</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {duplicates.map((c) => (
              <div key={c._id} className="bg-white border-2 border-amber-400 p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-mono font-bold text-xs bg-amber-600 text-white px-2.5 py-0.5">
                    FLAGGED DUPLICATE
                  </span>
                  <span className="font-mono text-xs text-slate-500 font-bold">
                    CMP-{String(c._id).slice(-4).toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Complainant Name</span>
                    <span className="font-bold text-slate-900">{c.citizenName || 'Civic Citizen'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">CNIC</span>
                    <span className="font-mono font-bold text-emerald-800">{c.cnic || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">City & Category</span>
                    <span className="font-bold text-slate-900">{c.city} • {c.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Assigned Dept</span>
                    <span className="font-bold text-slate-900">{c.assignedDepartment || 'General Admin'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-normal bg-slate-50 p-3 border border-slate-200">
                  {c.description}
                </p>

                <div className="text-[11px] text-slate-600 flex items-center gap-1 font-semibold">
                  <MapPin size={13} className="text-emerald-700" /> Location: {c.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDuplicates;
