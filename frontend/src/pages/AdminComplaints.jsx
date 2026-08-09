import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Search,
  Filter,
  Loader2,
  AlertCircle,
  MapPin,
  Eye,
  CheckCircle,
  Building2,
  X,
  CreditCard,
  Phone,
  User,
  MessageSquare,
  Save,
  Image as ImageIcon
} from 'lucide-react';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [resolutionInput, setResolutionInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    category: '',
    priority: '',
    status: '',
    department: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(Array.isArray(res.data) ? res.data : (res.data.complaints || []));
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/complaints/${id}`, { status: newStatus });
      setComplaints(prev => prev.map(c => String(c._id) === String(id) ? { ...c, status: newStatus } : c));
      if (selectedComplaint && String(selectedComplaint._id) === String(id)) {
        setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDepartmentChange = async (id, newDept) => {
    setUpdatingId(id);
    try {
      await api.put(`/complaints/${id}`, { assignedDepartment: newDept });
      setComplaints(prev => prev.map(c => String(c._id) === String(id) ? { ...c, assignedDepartment: newDept } : c));
      if (selectedComplaint && String(selectedComplaint._id) === String(id)) {
        setSelectedComplaint(prev => ({ ...prev, assignedDepartment: newDept }));
      }
    } catch (err) {
      console.error('Failed to assign department:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveResolutionNotes = async (id) => {
    if (!id) return;
    setUpdatingId(id);
    try {
      await api.put(`/complaints/${id}`, { resolutionNotes: resolutionInput });
      setComplaints(prev => prev.map(c => String(c._id) === String(id) ? { ...c, resolutionNotes: resolutionInput } : c));
      if (selectedComplaint && String(selectedComplaint._id) === String(id)) {
        setSelectedComplaint(prev => ({ ...prev, resolutionNotes: resolutionInput }));
      }
    } catch (err) {
      console.error('Failed to save resolution notes:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetailsModal = (complaint) => {
    setSelectedComplaint(complaint);
    setResolutionInput(complaint.resolutionNotes || '');
  };

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'];
  const categories = ['Road', 'Water', 'Waste', 'Electricity', 'Drainage', 'Safety', 'Other'];
  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  const statuses = ['Open', 'Assigned', 'In Progress', 'Resolved'];
  const departments = [
    'PWD Department',
    'Water Supply Department',
    'Sanitation Department',
    'Electricity Board',
    'Sewage Department',
    'Police Department',
    'General Administration'
  ];

  const filtered = complaints.filter(c => {
    const searchLower = filters.search.toLowerCase();
    const idStr = `CMP-${String(c._id).slice(-4).toUpperCase()}`;
    const matchesSearch = !filters.search ||
      c.description?.toLowerCase().includes(searchLower) ||
      c.location?.toLowerCase().includes(searchLower) ||
      (c.citizenName && c.citizenName.toLowerCase().includes(searchLower)) ||
      (c.cnic && c.cnic.includes(searchLower)) ||
      idStr.toLowerCase().includes(searchLower);

    return matchesSearch &&
      (!filters.city || c.city === filters.city) &&
      (!filters.category || c.category === filters.category) &&
      (!filters.priority || c.priority === filters.priority) &&
      (!filters.status || c.status === filters.status) &&
      (!filters.department || (c.assignedDepartment || c.assigned_department) === filters.department);
  });

  const priorityColors = {
    Critical: 'bg-rose-100 text-rose-800 border-rose-400 font-bold',
    High: 'bg-amber-100 text-amber-800 border-amber-400 font-semibold',
    Medium: 'bg-slate-100 text-slate-800 border-slate-300',
    Low: 'bg-emerald-50 text-emerald-800 border-emerald-300'
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-emerald-700 pb-3">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            Grievances & Citizen CNIC Management
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Filter by City & CNIC, inspect photo evidence, and review official inspection summaries
          </p>
        </div>
        <div className="bg-[#064e3b] text-white px-4 py-2 text-xs font-mono font-bold border border-emerald-500">
          Total Grievances: {complaints.length}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 border-2 border-slate-300 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search CNIC, Name, ID..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <select
            value={filters.city}
            onChange={e => setFilters({ ...filters, city: e.target.value })}
            className="bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
          >
            <option value="">All Cities</option>
            {cities.map(ct => <option key={ct} value={ct}>{ct}</option>)}
          </select>

          <select
            value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value })}
            className="bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select
            value={filters.priority}
            onChange={e => setFilters({ ...filters, priority: e.target.value })}
            className="bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
          >
            <option value="">All Priorities</option>
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
          >
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filters.department}
            onChange={e => setFilters({ ...filters, department: e.target.value })}
            className="bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-semibold">
          <span>Showing {filtered.length} of {complaints.length} records</span>
          {(filters.search || filters.city || filters.category || filters.priority || filters.status || filters.department) && (
            <button
              onClick={() => setFilters({ search: '', city: '', category: '', priority: '', status: '', department: '' })}
              className="text-[#064e3b] hover:underline font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-slate-300 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={36} className="animate-spin text-[#064e3b]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle size={36} className="text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 text-xs font-semibold">No complaint records match your current filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#064e3b] text-white uppercase tracking-wider font-extrabold border-b-2 border-emerald-500">
                <tr>
                  <th className="py-3 px-4">Photo</th>
                  <th className="py-3 px-4">ID & City</th>
                  <th className="py-3 px-4">Citizen CNIC & Name</th>
                  <th className="py-3 px-4">Grievance Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status Update</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filtered.map(c => {
                  const idStr = `CMP-${String(c._id).slice(-4).toUpperCase()}`;
                  const dept = c.assignedDepartment || c.assigned_department || 'Unassigned';

                  return (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      {/* Photo Preview Thumbnail */}
                      <td className="py-3 px-4">
                        {c.imageUrl ? (
                          <div className="w-12 h-12 border border-slate-300 overflow-hidden bg-slate-900 shrink-0">
                            <img src={c.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-[#064e3b]">{idStr}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-bold">
                          <MapPin size={11} className="text-emerald-700" /> {c.city || 'Karachi'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <User size={12} className="text-emerald-700" /> {c.citizenName || 'Civic Citizen'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1 mt-0.5">
                          <CreditCard size={11} className="text-slate-400" /> {c.cnic || '42101-0000000-0'}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-800 font-medium">{c.description}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-semibold">
                          <MapPin size={10} /> {c.location || 'General Area'}
                        </p>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {c.category}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-none font-bold border uppercase text-[10px] ${priorityColors[c.priority] || priorityColors.Medium}`}>
                          {c.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={c.status || 'Open'}
                          onChange={e => handleStatusChange(c._id, e.target.value)}
                          disabled={updatingId === c._id}
                          className="bg-slate-50 border border-slate-300 text-xs px-2 py-1 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                        >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openDetailsModal(c)}
                          className="inline-flex items-center gap-1 bg-[#064e3b] text-white hover:bg-[#00401a] px-3 py-1 text-xs font-bold uppercase transition-all"
                        >
                          <Eye size={13} /> Inspect & Remarks
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect & Remarks Modal with Clean Photo Inspection Box */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-4 border-[#064e3b] max-w-2xl w-full p-6 space-y-4 shadow-xl relative my-8">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-1 border border-slate-300"
            >
              <X size={18} />
            </button>

            <div className="border-b-2 border-slate-200 pb-3">
              <h3 className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
                Municipal Grievance Full Specs
                <span className="text-xs font-mono px-2.5 py-0.5 bg-[#064e3b] text-white">
                  CMP-{String(selectedComplaint._id).slice(-4).toUpperCase()}
                </span>
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">Municipal Officer Inspection & Verification Center</p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 border border-slate-300 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Complainant</div>
                <div className="font-bold text-slate-900">{selectedComplaint.citizenName || 'Civic Citizen'}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">National CNIC</div>
                <div className="font-mono font-bold text-[#064e3b]">{selectedComplaint.cnic || '42101-0000000-0'}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Contact & City</div>
                <div className="font-bold text-slate-900">{selectedComplaint.city || 'Karachi'} ({selectedComplaint.phone || 'N/A'})</div>
              </div>
            </div>

            {/* Photo & Inspection Box */}
            {selectedComplaint.imageUrl && (
              <div className="bg-slate-900 text-white p-4 border-2 border-emerald-500 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/40 pb-2">
                  <span className="text-xs font-mono font-bold uppercase text-emerald-300">
                    Official Field Photo Inspection
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-700 text-white px-2 py-0.5 font-bold uppercase">
                    Verification Score: {Math.round((selectedComplaint.aiOutput?.confidence || 0.95) * 100)}%
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 items-center">
                  <div className="h-44 border border-emerald-500/50 overflow-hidden bg-black flex items-center justify-center">
                    <img src={selectedComplaint.imageUrl} alt="Complaint Evidence" className="max-h-full max-w-full object-contain" />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-800 p-2.5 border border-emerald-500/30 font-mono text-[11px] leading-relaxed text-emerald-100">
                      <span className="font-bold text-emerald-400 block mb-1">Visual Inspection Summary:</span>
                      {selectedComplaint.aiOutput?.visualSummary || 'Visual Inspection: Municipal site hazard photographed and verified.'}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-slate-800 p-1.5 border border-slate-700">
                        <span className="text-slate-400 block">Category:</span>
                        <span className="font-bold text-white">{selectedComplaint.aiOutput?.category || selectedComplaint.category}</span>
                      </div>
                      <div className="bg-slate-800 p-1.5 border border-slate-700">
                        <span className="text-slate-400 block">Priority:</span>
                        <span className="font-bold text-emerald-400">{selectedComplaint.aiOutput?.priority || selectedComplaint.priority}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 uppercase">Grievance Location & Description</label>
              <p className="bg-slate-50 p-3 text-xs text-slate-900 border border-slate-300 leading-relaxed font-medium">
                {selectedComplaint.description}
              </p>
              <div className="text-[11px] text-slate-600 flex items-center gap-1 font-bold pt-0.5">
                <MapPin size={12} className="text-emerald-700" /> Location: {selectedComplaint.location}
              </div>
            </div>

            {/* Resolution Remarks Textarea */}
            <div className="space-y-2 bg-slate-100 p-4 border border-slate-300">
              <label className="text-xs font-black uppercase text-[#064e3b] flex items-center gap-1.5">
                <MessageSquare size={14} /> Official Officer Resolution Remarks (Visible to Citizen)
              </label>
              <textarea
                rows={3}
                placeholder="Enter inspection remarks, dispatch notes, or resolution update for citizen..."
                value={resolutionInput}
                onChange={e => setResolutionInput(e.target.value)}
                className="w-full bg-white border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveResolutionNotes(selectedComplaint._id)}
                  disabled={updatingId === selectedComplaint._id}
                  className="bg-[#064e3b] hover:bg-[#00401a] text-white text-xs font-bold uppercase px-4 py-2 flex items-center gap-1.5 border border-emerald-500"
                >
                  <Save size={14} /> Save Officer Remarks
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase px-4 py-2 border border-slate-400"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
