import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { SkeletonTable } from '../components/Loader';
import {
  Search,
  Filter,
  Eye,
  User,
  CreditCard,
  MapPin,
  X,
  Save,
  ImageIcon,
  Building2,
  MessageSquare,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionInput, setResolutionInput] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    category: '',
    priority: '',
    status: ''
  });

  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const cities = ['Karachi', 'Lahore', 'Hyderabad', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad', 'Sialkot', 'Gujranwala', 'Sukkur', 'Larkana', 'Muzaffarabad', 'Gilgit'];
  const categories = ['Road', 'Water', 'Waste', 'Electricity', 'Drainage', 'Safety', 'Other'];
  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  const statuses = ['Open', 'Assigned', 'In Progress', 'Resolved'];

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Freeze background page scroll when modal is open
  useEffect(() => {
    if (selectedComplaint) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedComplaint]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
      setComplaints(res.data || []);
    } catch (e) {
      console.error('Failed to fetch complaints:', e);
      toast.error('Failed to fetch municipal complaints list.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await api.put(`/complaints/${id}`, { status: newStatus });
      setComplaints(prev => prev.map(c => c._id === id ? res.data : c));
      if (selectedComplaint && selectedComplaint._id === id) {
        setSelectedComplaint(res.data);
      }
      toast.success(`Complaint status updated to [${newStatus}].`);
    } catch (e) {
      console.error('Failed to update status:', e);
      toast.error(e.response?.data?.error || 'Failed to update complaint status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveResolution = async () => {
    if (!selectedComplaint) return;
    try {
      setUpdatingId(selectedComplaint._id);
      const res = await api.put(`/complaints/${selectedComplaint._id}`, {
        status: selectedComplaint.status,
        resolutionNotes: resolutionInput
      });
      setComplaints(prev => prev.map(c => c._id === selectedComplaint._id ? res.data : c));
      setSelectedComplaint(res.data);
      toast.success('Officer inspection remarks saved successfully.');
    } catch (e) {
      console.error('Failed to save resolution notes:', e);
      toast.error(e.response?.data?.error || 'Failed to save remarks.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openInspectModal = (complaint) => {
    setSelectedComplaint(complaint);
    setResolutionInput(complaint.resolutionNotes || '');
  };

  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const searchLower = searchTerm.toLowerCase().trim();
    const idStr = `cmp-${String(c._id).slice(-4)}`.toLowerCase();
    
    const matchesSearch = !searchTerm || (
      (c.description || '').toLowerCase().includes(searchLower) ||
      (c.citizenName || '').toLowerCase().includes(searchLower) ||
      (c.cnic || '').includes(searchLower) ||
      (c.location || '').toLowerCase().includes(searchLower) ||
      idStr.includes(searchLower)
    );

    const matchesCity = !filters.city || c.city === filters.city;
    const matchesCat = !filters.category || c.category === filters.category;
    const matchesPri = !filters.priority || c.priority === filters.priority;
    const matchesStat = !filters.status || c.status === filters.status;

    return matchesSearch && matchesCity && matchesCat && matchesPri && matchesStat;
  });

  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    if (sortField === 'date') {
      const tA = new Date(a.createdAt || 0).getTime();
      const tB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'asc' ? tA - tB : tB - tA;
    }
    if (sortField === 'priority') {
      const weights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const wA = weights[a.priority] || 0;
      const wB = weights[b.priority] || 0;
      return sortOrder === 'asc' ? wA - wB : wB - wA;
    }
    if (sortField === 'status') {
      return sortOrder === 'asc' ? (a.status || '').localeCompare(b.status || '') : (b.status || '').localeCompare(a.status || '');
    }
    if (sortField === 'id') {
      return sortOrder === 'asc' ? (a._id || '').localeCompare(b._id || '') : (b._id || '').localeCompare(a._id || '');
    }
    if (sortField === 'category') {
      return sortOrder === 'asc' ? (a.category || '').localeCompare(b.category || '') : (b.category || '').localeCompare(a.category || '');
    }
    return 0;
  });

  const priorityBadges = {
    Critical: 'bg-rose-600 text-white border-rose-400 font-black',
    High: 'bg-amber-500 text-white border-amber-300 font-bold',
    Medium: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    Low: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
  };

  const statusBadges = {
    Open: 'bg-slate-100 text-slate-800 border-slate-300',
    Assigned: 'bg-blue-100 text-blue-900 border-blue-300',
    'In Progress': 'bg-amber-100 text-amber-900 border-amber-300',
    Resolved: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-50" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-emerald-300" /> : <ArrowDown size={12} className="text-emerald-300" />;
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
            Filter by City & CNIC, click column headers or dropdown to SORT records live
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#064e3b] text-white px-4 py-2 text-xs font-mono font-bold border border-emerald-500 shrink-0">
            Total: {complaints.length}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 border-2 border-slate-300 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
            <Filter size={14} className="text-emerald-700" /> Filter & Search Registry
          </div>
          {(searchTerm || filters.city || filters.category || filters.priority || filters.status) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ city: '', category: '', priority: '', status: '' });
                setSortField('date');
                setSortOrder('desc');
              }}
              className="text-[11px] font-bold text-rose-700 hover:underline uppercase"
            >
              Reset Filters & Sort
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-1">
            <Search size={14} className="absolute left-2.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search CNIC, ID, Citizen..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 pl-8 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <select
            value={filters.city}
            onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))}
            className="bg-slate-50 border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
          >
            <option value="">All Major Cities</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="bg-slate-50 border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="bg-slate-50 border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
          >
            <option value="">All Priority Levels</option>
            {priorities.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="bg-slate-50 border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
          >
            <option value="">All Statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Complaints Table with Clickable Column Headers */}
      <div className="bg-white border-2 border-slate-300 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={8} />
          </div>
        ) : sortedComplaints.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Filter size={32} className="mx-auto text-slate-400" />
            <h3 className="font-bold text-sm text-slate-800 uppercase">No Grievances Found</h3>
            <p className="text-xs text-slate-500 font-medium">Try adjusting your CNIC, City, or Category filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#064e3b] text-white border-b-2 border-emerald-500 uppercase font-mono text-[11px] select-none">
                  <th className="py-3 px-4">Evidence</th>

                  <th
                    onClick={() => handleSortToggle('id')}
                    className="py-3 px-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      Grievance Ref & City {renderSortIcon('id')}
                    </div>
                  </th>

                  <th className="py-3 px-4">Citizen & CNIC</th>

                  <th className="py-3 px-4">Description & Site</th>

                  <th
                    onClick={() => handleSortToggle('category')}
                    className="py-3 px-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      Category {renderSortIcon('category')}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSortToggle('priority')}
                    className="py-3 px-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      Priority Level {renderSortIcon('priority')}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSortToggle('status')}
                    className="py-3 px-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      Official Status {renderSortIcon('status')}
                    </div>
                  </th>

                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedComplaints.map(c => {
                  const idStr = `CMP-${String(c._id).slice(-4).toUpperCase()}`;

                  return (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
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
                        <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold border ${priorityBadges[c.priority] || priorityBadges.Medium}`}>
                          {c.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={c.status}
                          onChange={e => handleStatusChange(c._id, e.target.value)}
                          disabled={updatingId === c._id}
                          className={`px-2 py-1 text-[11px] font-bold border focus:outline-none cursor-pointer ${statusBadges[c.status] || statusBadges.Open}`}
                        >
                          {statuses.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openInspectModal(c)}
                          className="bg-[#064e3b] hover:bg-[#00401a] text-white px-3 py-1.5 text-[11px] font-bold uppercase flex items-center gap-1 ml-auto border border-emerald-500 shadow-sm"
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

      {/* Inspect & Remarks Modal */}
      {selectedComplaint && createPortal(
        <div
          onClick={() => setSelectedComplaint(null)}
          className="fixed top-0 left-0 w-screen h-screen inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-4 border-[#064e3b] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl relative animate-modal-pop text-slate-900"
          >
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
                <div className="font-mono font-bold text-emerald-800">{selectedComplaint.cnic || '42101-0000000-0'}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Contact & City</div>
                <div className="font-bold text-slate-900">{selectedComplaint.phone || 'N/A'} ({selectedComplaint.city || 'Karachi'})</div>
              </div>
            </div>

            {/* Photo Evidence Box */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <ImageIcon size={14} className="text-emerald-700" /> Ground Site Evidence Photo:
              </div>
              {selectedComplaint.imageUrl ? (
                <div className="bg-slate-100 p-3 border-2 border-slate-300 flex flex-col items-center justify-center">
                  <img
                    src={selectedComplaint.imageUrl}
                    alt="Grievance Ground Evidence"
                    className="max-h-72 object-contain border-2 border-[#064e3b]"
                  />
                  <span className="text-[10px] font-mono text-[#064e3b] mt-2 font-bold uppercase">
                    Photo Upload Verified • Municipal Geotag Location
                  </span>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 border-2 border-dashed border-slate-300 text-center space-y-1">
                  <ImageIcon size={28} className="mx-auto text-slate-400" />
                  <p className="text-xs font-bold text-slate-600 uppercase">No Image Evidence Attached</p>
                  <p className="text-[11px] text-slate-500 font-medium">Text Description Complaint Filed</p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-700 uppercase">Grievance Description</div>
              <p className="text-xs text-slate-800 leading-relaxed font-normal bg-slate-50 p-3 border border-slate-300">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Official Inspection Summary */}
            {selectedComplaint.aiOutput?.visualSummary && (
              <div className="bg-emerald-50 border border-emerald-300 p-3 text-xs font-mono text-emerald-950 space-y-1">
                <div className="font-bold uppercase text-emerald-900">Official Municipal Inspection Notes:</div>
                <p>{selectedComplaint.aiOutput.visualSummary}</p>
              </div>
            )}

            {/* Admin Resolution Input Box (CLEAN MUNICIPAL EXECUTIVE LIGHT THEME) */}
            <div className="bg-emerald-50/60 p-4 space-y-3 border-2 border-[#064e3b]">
              <div className="flex items-center justify-between text-xs border-b border-emerald-200 pb-2">
                <span className="text-[#064e3b] font-mono font-black uppercase text-[11px] flex items-center gap-1.5">
                  <Building2 size={15} className="text-[#064e3b]" /> Department:
                </span>
                <span className="font-extrabold text-slate-900 uppercase bg-white px-2.5 py-0.5 border border-emerald-300">
                  {selectedComplaint.assignedDepartment || 'General Admin'}
                </span>
              </div>

              <div>
                <label className="text-xs text-[#064e3b] font-bold uppercase flex items-center gap-1.5 mb-1.5">
                  <MessageSquare size={14} /> Update Official Officer Remarks:
                </label>
                <textarea
                  rows="3"
                  value={resolutionInput}
                  onChange={e => setResolutionInput(e.target.value)}
                  placeholder="Enter official resolution notes, inspection findings, or dispatch instructions..."
                  className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 font-mono font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveResolution}
                  disabled={updatingId === selectedComplaint._id}
                  className="bg-[#064e3b] hover:bg-[#00401a] text-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-500 transition-all cursor-pointer shadow-sm"
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminComplaints;
