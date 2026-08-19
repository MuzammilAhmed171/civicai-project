import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  User,
  CreditCard,
  Phone,
  MapPin,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';
import { SkeletonGrid } from '../components/Loader';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyComplaints();
  }, [user]);

  const fetchMyComplaints = async () => {
    try {
      let url = '/complaints';
      if (user?.cnic) {
        url = `/complaints?cnic=${encodeURIComponent(user.cnic)}`;
      } else if (user?._id) {
        url = `/complaints?user=${user._id}`;
      }

      const res = await api.get(url);
      const data = Array.isArray(res.data) ? res.data : (res.data.complaints || []);

      const userComplaints = user?.cnic
        ? data.filter(c => c.cnic === user.cnic || String(c.user) === String(user._id))
        : data;

      setComplaints(userComplaints);
    } catch (e) {
      console.error('Failed to fetch user complaints:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'Open': return 1;
      case 'Assigned': return 2;
      case 'In Progress': return 3;
      case 'Resolved':
      case 'Closed': return 4;
      default: return 1;
    }
  };

  const priorityColors = {
    Critical: 'bg-rose-600 text-white font-extrabold border border-rose-400 shadow-sm',
    High: 'bg-amber-500 text-white font-bold border border-amber-300 shadow-sm',
    Medium: 'bg-amber-100 text-amber-950 font-bold border border-amber-300',
    Low: 'bg-emerald-100 text-emerald-950 font-bold border border-emerald-300'
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Card Banner */}
        <div className="bg-[#064e3b] text-white p-6 sm:p-8 border-b-4 border-emerald-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="inline-block bg-[#00401a] border border-emerald-400 px-3 py-0.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-200">
              Verified Citizen Account Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Welcome, {user?.name || 'Citizen'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100">
              Monitor live municipal resolution progress & officer inspection remarks
            </p>
          </div>

          <Link
            to="/submit"
            className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-6 py-3 font-extrabold text-xs uppercase tracking-wider border border-white shadow-md transition-all shrink-0"
          >
            <PlusCircle size={16} /> Submit New Grievance
          </Link>
        </div>

        {/* User Info Quick Specs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 border border-slate-300 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#064e3b] text-white flex items-center justify-center shrink-0">
              <CreditCard size={18} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">National CNIC</div>
              <div className="text-xs font-mono font-bold text-slate-900">{user?.cnic || 'N/A'}</div>
            </div>
          </div>

          <div className="bg-white p-4 border border-slate-300 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#064e3b] text-white flex items-center justify-center shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Registered City</div>
              <div className="text-xs font-bold text-slate-900">{user?.city || 'Karachi'}</div>
            </div>
          </div>

          <div className="bg-white p-4 border border-slate-300 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#064e3b] text-white flex items-center justify-center shrink-0">
              <Phone size={18} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Contact Phone</div>
              <div className="text-xs font-bold text-slate-900">{user?.phone || 'N/A'}</div>
            </div>
          </div>

          <div className="bg-white p-4 border border-slate-300 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#064e3b] text-white flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Total Filed Grievances</div>
              <div className="text-xs font-bold text-slate-900">{complaints.length}</div>
            </div>
          </div>
        </div>

        {/* Complaints Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-emerald-700 pb-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              My Grievance Reports & Resolution Progress
            </h2>
            <span className="text-xs text-slate-500 font-bold uppercase">Official Status Records</span>
          </div>

          {loading ? (
            <SkeletonGrid count={2} />
          ) : complaints.length === 0 ? (
            <div className="bg-white p-10 text-center border border-slate-300 space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-300">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900 uppercase">No Grievances Logged</h3>
              <p className="text-slate-600 text-xs max-w-md mx-auto">
                You have not filed any civic complaints yet. If you observe damaged infrastructure, water leaks, or garbage accumulation in your district, register a complaint.
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 bg-[#064e3b] text-white px-6 py-2.5 text-xs font-bold uppercase border border-emerald-500"
              >
                Submit First Grievance
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {complaints.map((c) => {
                const stepIdx = getStepIndex(c.status);
                const idStr = `CMP-${String(c._id).slice(-4).toUpperCase()}`;

                return (
                  <div key={c._id} className="bg-white border-2 border-slate-300 p-5 space-y-4 shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white bg-[#064e3b] text-xs px-3 py-1">
                          {idStr}
                        </span>
                        <div>
                          <span className="font-black text-slate-900 text-sm uppercase">{c.category}</span>
                          <span className="text-slate-400 text-xs mx-2">•</span>
                          <span className="text-slate-600 text-xs font-semibold">{c.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-[11px] uppercase ${priorityColors[c.priority] || priorityColors.Medium}`}>
                          PRIORITY: {c.priority}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono font-bold">
                          {new Date(c.createdAt || c.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Photo + Description Grid */}
                    <div className="grid md:grid-cols-12 gap-4 items-start">
                      {c.imageUrl && (
                        <div className="md:col-span-4 h-40 border-2 border-slate-300 overflow-hidden bg-slate-100 flex items-center justify-center">
                          <img src={c.imageUrl} alt="Grievance Evidence" className="max-h-full max-w-full object-contain" />
                        </div>
                      )}

                      <div className={`${c.imageUrl ? 'md:col-span-8' : 'md:col-span-12'} space-y-2`}>
                        <p className="text-xs text-slate-800 leading-relaxed font-normal bg-slate-50 p-3 border border-slate-200">
                          {c.description}
                        </p>
                        {c.aiOutput?.visualSummary && (
                          <div className="bg-emerald-50 border border-emerald-300 p-2.5 text-[11px] text-emerald-900 font-mono">
                            <span className="font-bold uppercase block text-emerald-800">
                              Official Site Inspection Notes:
                            </span>
                            {c.aiOutput.visualSummary}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sharp Stepper */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resolution Stage Stepper</div>
                      <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold uppercase">
                        <div className={`p-2 border ${stepIdx >= 1 ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-slate-50 text-slate-400 border-slate-300'}`}>
                          1. Submitted
                        </div>
                        <div className={`p-2 border ${stepIdx >= 2 ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-slate-50 text-slate-400 border-slate-300'}`}>
                          2. Assigned
                        </div>
                        <div className={`p-2 border ${stepIdx >= 3 ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-400 border-slate-300'}`}>
                          3. In Progress
                        </div>
                        <div className={`p-2 border ${stepIdx >= 4 ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                          4. Resolved
                        </div>
                      </div>
                    </div>

                    {/* Department & Remarks (CLEAN MUNICIPAL EXECUTIVE LIGHT THEME) */}
                    <div className="bg-emerald-50/60 p-4 space-y-2 border-2 border-[#064e3b]">
                      <div className="flex items-center justify-between text-xs border-b border-emerald-200 pb-2">
                        <span className="text-[#064e3b] font-mono flex items-center gap-1.5 font-black uppercase text-[11px]">
                          <Building2 size={15} className="text-[#064e3b]" /> Assigned Body:
                        </span>
                        <span className="font-extrabold text-slate-900 uppercase bg-white px-2.5 py-0.5 border border-emerald-300">
                          {c.assignedDepartment || 'General Administration'}
                        </span>
                      </div>

                      <div>
                        <div className="text-[11px] text-[#064e3b] flex items-center gap-1.5 mb-1 font-extrabold uppercase">
                          <MessageSquare size={13} /> Official Officer Remarks:
                        </div>
                        <p className="text-xs text-slate-900 font-mono bg-white p-2.5 border border-slate-300 font-medium">
                          {c.resolutionNotes || 'Grievance logged. Inspection pending.'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
