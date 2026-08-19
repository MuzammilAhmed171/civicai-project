import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { SkeletonStackGrid } from '../components/Loader';
import { useToast } from '../context/ToastContext';
import {
  CopyCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  SlidersHorizontal,
  Check
} from 'lucide-react';

const AdminDuplicates = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStack, setSelectedStack] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef(null);

  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    category: '',
    priority: '',
    status: ''
  });

  const [sortBy, setSortBy] = useState('count-desc');

  const cities = ['Karachi', 'Lahore', 'Hyderabad', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'];
  const categories = ['Road', 'Water', 'Waste', 'Electricity', 'Drainage', 'Safety', 'Other'];
  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  const statuses = ['Open', 'Assigned', 'In Progress', 'Resolved'];

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setIsSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedStack) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedStack]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
      setComplaints(res.data || []);
    } catch (e) {
      console.error('Failed to fetch duplicate complaints:', e);
      toast.error('Failed to fetch grievance data.');
    } finally {
      setLoading(false);
    }
  };

  const groupDuplicates = (list) => {
    const activeComplaints = list.filter(c => c.status !== 'Resolved');
    const map = new Map();

    activeComplaints.forEach(c => {
      const cityKey = (c.city || 'Karachi').toLowerCase().trim();
      const catKey = (c.category || 'Other').toLowerCase().trim();
      const addrSnippet = (c.addressLine1 || c.location || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);

      const groupKey = c.duplicateGroupId
        ? `group_${c.duplicateGroupId}`
        : `geo_${cityKey}_${catKey}_${addrSnippet}`;

      if (!map.has(groupKey)) {
        map.set(groupKey, []);
      }
      map.get(groupKey).push(c);
    });

    const stacks = [];
    map.forEach((items, key) => {
      if (items.length >= 2) {
        items.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        stacks.push({
          groupId: key,
          primary: items[0],
          duplicates: items.slice(1),
          totalCount: items.length,
          allComplaints: items
        });
      }
    });

    return stacks;
  };

  // REAL-TIME OPTIMISTIC & MONGODB ATLAS GUARANTEED PERSISTENT STATUS UPDATE HANDLER
  const handleStatusChangeInStack = async (targetStack, newStatus) => {
    if (!targetStack || !targetStack.allComplaints.length) return;

    try {
      setActionLoading(true);
      const stackComplaintIds = targetStack.allComplaints.map(c => String(c._id));

      // 1. OPTIMISTIC REAL-TIME UI UPDATE IN REACT MEMORY
      setComplaints(prev => prev.map(c => {
        if (stackComplaintIds.includes(String(c._id))) {
          return { ...c, status: newStatus };
        }
        return c;
      }));

      if (newStatus === 'Resolved') {
        setSelectedStack(null);
        toast.success(`Stack of ${targetStack.totalCount} reports marked as Resolved.`);
      } else {
        setSelectedStack({
          ...targetStack,
          primary: { ...targetStack.primary, status: newStatus },
          allComplaints: targetStack.allComplaints.map(c => ({ ...c, status: newStatus }))
        });
        toast.success(`Stack status updated to [${newStatus}].`);
      }

      // 2. PERSIST EVERY COMPLAINT IN STACK TO MONGODB ATLAS IN BACKEND
      const updatePromises = targetStack.allComplaints.map(c =>
        api.put(`/complaints/${c._id}`, {
          status: newStatus,
          resolutionNotes: `Synchronized stack status updated to ${newStatus} by Municipal Officer.`
        })
      );
      await Promise.all(updatePromises);

      // 3. CONFIRM PERSISTENCE BY RE-FETCHING FROM MONGODB ATLAS
      const res = await api.get('/complaints');
      if (res.data) {
        setComplaints(Array.isArray(res.data) ? res.data : (res.data.complaints || []));
      }
    } catch (e) {
      console.error('Failed to update stack status:', e);
      toast.error('Failed to update status.');
      fetchComplaints();
    } finally {
      setActionLoading(false);
    }
  };

  const allStacks = groupDuplicates(complaints);

  const filteredStacks = allStacks.filter(stack => {
    const primary = stack.primary;
    const searchLower = searchTerm.toLowerCase().trim();

    const matchesSearch = !searchTerm || stack.allComplaints.some(item => (
      (item.description || '').toLowerCase().includes(searchLower) ||
      (item.citizenName || '').toLowerCase().includes(searchLower) ||
      (item.cnic || '').includes(searchLower) ||
      `cmp-${String(item._id).slice(-4)}`.includes(searchLower)
    ));

    const matchesCity = !filters.city || primary.city === filters.city;
    const matchesCat = !filters.category || primary.category === filters.category;
    const matchesPri = !filters.priority || primary.priority === filters.priority;
    const matchesStat = !filters.status || primary.status === filters.status;

    return matchesSearch && matchesCity && matchesCat && matchesPri && matchesStat;
  });

  const sortedStacks = [...filteredStacks].sort((a, b) => {
    if (sortBy === 'count-desc') {
      return b.totalCount - a.totalCount;
    }
    if (sortBy === 'date-desc') {
      return new Date(b.primary.createdAt || 0) - new Date(a.primary.createdAt || 0);
    }
    if (sortBy === 'priority-desc') {
      const weights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (weights[b.primary.priority] || 0) - (weights[a.primary.priority] || 0);
    }
    if (sortBy === 'city-asc') {
      return (a.primary.city || '').localeCompare(b.primary.city || '');
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
    Open: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
    Assigned: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
    'In Progress': 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    Resolved: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
  };

  const sortLabels = {
    'count-desc': 'Most Duplicates',
    'priority-desc': 'Priority Critical',
    'date-desc': 'Date Newest',
    'city-asc': 'City A-Z'
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-emerald-700 pb-3">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <CopyCheck className="text-emerald-700" size={26} /> Duplicate Grievances & Stacks
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Consolidated view of repeated citizen complaints (Resolved items automatically hide)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* ICON-ONLY SORT BUTTON WITH EXECUTIVE LIGHT DROPDOWN MENU */}
          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => setIsSortMenuOpen(prev => !prev)}
              className="bg-[#064e3b] hover:bg-[#00401a] text-white p-2.5 border-2 border-emerald-500 shadow-sm transition-all flex items-center justify-center cursor-pointer"
              title="Sort Grievance Stacks"
            >
              <SlidersHorizontal size={18} className="text-white" />
            </button>

            {isSortMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white text-slate-900 border-2 border-[#064e3b] shadow-2xl z-50 py-1.5 text-xs font-sans">
                <div className="px-3.5 py-1.5 font-black text-[10px] text-[#064e3b] border-b border-slate-200 uppercase tracking-wider bg-slate-50">
                  Sort Stacks Parameters
                </div>
                {Object.entries(sortLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSortBy(key);
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 font-bold transition-all flex items-center justify-between hover:bg-emerald-50 hover:text-[#064e3b] ${sortBy === key ? 'text-[#064e3b] bg-emerald-50/80 font-black' : 'text-slate-700'}`}
                  >
                    <span>{label}</span>
                    {sortBy === key && <Check size={14} className="text-emerald-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#064e3b] text-white px-4 py-2 text-xs font-mono font-bold border border-emerald-500 shrink-0">
            Active Stacks: {allStacks.length}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 border-2 border-slate-300 space-y-3 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
            <Filter size={14} className="text-emerald-700" /> Filter Duplicate Stacks
          </div>
          {(searchTerm || filters.city || filters.category || filters.priority || filters.status) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ city: '', category: '', priority: '', status: '' });
                setSortBy('count-desc');
              }}
              className="text-[11px] font-bold text-rose-700 hover:underline uppercase"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-1">
            <Search size={14} className="absolute left-2.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search CNIC, Ref ID, Keyword..."
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

      {/* Duplicate Cards Grid with MATCHING SKELETON LOADING */}
      {loading ? (
        <SkeletonStackGrid count={6} />
      ) : sortedStacks.length === 0 ? (
        <div className="bg-white border-2 border-slate-300 p-12 text-center space-y-2">
          <AlertTriangle size={32} className="mx-auto text-amber-500" />
          <h3 className="font-bold text-sm text-slate-800 uppercase">No Active Duplicate Stacks Found</h3>
          <p className="text-xs text-slate-500 font-medium">All duplicate reports have been resolved or no matching keywords were found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-2">
          {sortedStacks.map(stack => {
            const primary = stack.primary;
            const primaryId = `CMP-${String(primary._id).slice(-4).toUpperCase()}`;

            return (
              <div
                key={stack.groupId}
                className="relative group transition-all"
              >
                {/* Stack Layer 2 */}
                {stack.duplicates.length >= 2 && (
                  <div className="absolute -bottom-3 left-3 right-3 h-full bg-[#064e3b]/15 border-2 border-emerald-800/40 -z-20 transition-all group-hover:-bottom-4" />
                )}

                {/* Stack Layer 1 */}
                {stack.duplicates.length >= 1 && (
                  <div className="absolute -bottom-1.5 left-1.5 right-1.5 h-full bg-[#064e3b]/30 border-2 border-emerald-700/60 -z-10 transition-all group-hover:-bottom-2" />
                )}

                {/* Main Card */}
                <div className="bg-white border-2 border-[#064e3b] shadow-md hover:shadow-xl transition-all relative z-10 flex flex-col justify-between">
                  {/* Header Badge */}
                  <div className="bg-[#064e3b] text-white p-3 border-b-2 border-emerald-400 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-emerald-300">
                        {primaryId}
                      </span>
                      <span className="text-[10px] bg-emerald-800 text-white px-2 py-0.5 font-extrabold uppercase border border-emerald-400">
                        First Report
                      </span>
                    </div>

                    <div className="bg-amber-400 text-slate-950 px-2 py-0.5 text-[11px] font-black uppercase flex items-center gap-1 border border-white">
                      <Layers size={13} className="text-slate-900" />
                      +{stack.duplicates.length} Duplicate Reports
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    {/* Priority & Status Row */}
                    <div className="flex items-center justify-between bg-slate-100 p-2 border border-slate-300">
                      <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                        PRIORITY LEVEL:
                      </span>
                      <span className={`px-2.5 py-0.5 text-[11px] uppercase font-black border tracking-wider ${priorityBadges[primary.priority] || priorityBadges.Medium}`}>
                        {primary.priority}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-900 uppercase">Grievance Description:</h4>
                      <p className="text-xs text-slate-700 font-medium line-clamp-3 mt-1 bg-slate-50 p-2.5 border border-slate-200">
                        {primary.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 border border-slate-200 font-medium">
                      <div>
                        <span className="text-slate-500 font-bold uppercase block text-[9px]">City & Category:</span>
                        <span className="text-slate-900 font-bold block">{primary.city} • {primary.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold uppercase block text-[9px]">Location Area:</span>
                        <span className="text-slate-900 font-bold truncate block">{primary.location || primary.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3 bg-slate-100 border-t border-slate-300 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedStack(stack)}
                      className="flex-1 bg-[#064e3b] hover:bg-[#00401a] text-white py-2 px-3 text-xs font-bold uppercase flex items-center justify-center gap-1.5 border border-emerald-500 shadow-sm cursor-pointer"
                    >
                      <Eye size={14} /> Inspect Duplicate Stack
                    </button>

                    <button
                      onClick={() => handleStatusChangeInStack(stack, 'Resolved')}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-extrabold uppercase border border-emerald-500 shrink-0 flex items-center gap-1 cursor-pointer"
                      title="Mark All Reports in Stack as Resolved"
                    >
                      <CheckCircle2 size={15} /> Resolve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL OVERLAY MODAL WITH CLEAN LIGHT MUNICIPAL THEME (REAL-TIME STATUS SYNC) */}
      {selectedStack && createPortal(
        <div
          onClick={() => setSelectedStack(null)}
          className="fixed top-0 left-0 w-screen h-screen inset-0 z-[99999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-4 border-[#064e3b] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative animate-modal-pop text-slate-900"
          >
            {/* Modal Header (Rich Emerald Green #064e3b) */}
            <div className="bg-[#064e3b] text-white p-4 border-b-2 border-emerald-400 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                    Duplicate Grievances Inspection Window
                  </h3>
                  <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 text-xs font-mono font-extrabold border border-white">
                    {selectedStack.totalCount} TOTAL REPORTS IN STACK
                  </span>
                </div>
                <p className="text-xs text-emerald-200 font-medium mt-0.5">
                  Site Inspection • {selectedStack.primary.category} Division ({selectedStack.primary.city})
                </p>
              </div>

              <button
                onClick={() => setSelectedStack(null)}
                className="text-emerald-100 hover:text-white p-1 border border-emerald-400 hover:bg-emerald-800 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-white">
              {/* SINGLE EXECUTIVE STACK STATUS CONTROLLER */}
              <div className="bg-slate-100 text-slate-900 p-4 border-2 border-[#064e3b] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <span className="text-xs font-mono font-black uppercase text-[#064e3b] block">
                    Synchronized Stack Status Control:
                  </span>
                  <span className="text-sm font-black text-slate-900 uppercase">
                    Current Status: <span className="text-[#064e3b] font-mono font-bold bg-emerald-100 px-2 py-0.5 border border-emerald-300">{selectedStack.primary.status}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <div className="flex items-center gap-2 bg-white px-3 py-2 border-2 border-slate-300">
                    <span className="text-[11px] font-mono font-bold text-slate-700 uppercase">Update All To:</span>
                    <select
                      value={selectedStack.primary.status}
                      onChange={e => handleStatusChangeInStack(selectedStack, e.target.value)}
                      disabled={actionLoading}
                      className="bg-transparent text-slate-900 font-bold focus:outline-none text-xs cursor-pointer"
                    >
                      {statuses.map(st => (
                        <option key={st} value={st} className="bg-white text-slate-900">{st}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleStatusChangeInStack(selectedStack, 'Resolved')}
                    disabled={actionLoading}
                    className="bg-[#064e3b] hover:bg-[#00401a] text-white font-extrabold text-xs uppercase px-4 py-2 border border-emerald-500 transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <CheckCircle2 size={16} /> Resolve Entire Stack
                  </button>
                </div>
              </div>

              {/* Primary Complaint Specs Box */}
              <div className="bg-emerald-50/70 text-slate-900 p-4 border-2 border-emerald-600 space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="text-xs font-mono text-[#064e3b] font-black uppercase flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> Initial Grievance Specification: CMP-{String(selectedStack.primary._id).slice(-4).toUpperCase()}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[10px] uppercase font-black border ${priorityBadges[selectedStack.primary.priority] || priorityBadges.Medium}`}>
                    PRIORITY: {selectedStack.primary.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-semibold bg-white p-3 border border-emerald-300">
                  {selectedStack.primary.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 font-medium">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">First Complainant:</span>
                    <span className="font-bold text-slate-900 block">{selectedStack.primary.citizenName || 'Civic Citizen'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">National CNIC:</span>
                    <span className="font-mono text-[#064e3b] font-bold block">{selectedStack.primary.cnic || '42101-0000000-0'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Location Address:</span>
                    <span className="font-bold text-slate-900 block truncate">{selectedStack.primary.location || selectedStack.primary.city}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Synchronized Status:</span>
                    <span className="font-bold text-[#064e3b] block">{selectedStack.primary.status}</span>
                  </div>
                </div>
              </div>

              {/* Stacked Reports Detailed Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-slate-900 flex items-center gap-2">
                  <Layers size={16} className="text-emerald-700" />
                  All Stacked Reports ({selectedStack.totalCount} Citizen Reports)
                </h4>

                <div className="bg-white border-2 border-slate-300 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 uppercase font-mono text-[10px]">
                        <th className="py-2.5 px-3">Grievance Ref</th>
                        <th className="py-2.5 px-3">Citizen Name</th>
                        <th className="py-2.5 px-3">National CNIC</th>
                        <th className="py-2.5 px-3">Report Details</th>
                        <th className="py-2.5 px-3">Status Badge</th>
                        <th className="py-2.5 px-3">Date Filed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedStack.allComplaints.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#064e3b]">
                            CMP-{String(item._id).slice(-4).toUpperCase()}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {item.citizenName || 'Civic Citizen'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">
                            {item.cnic || '42101-0000000-0'}
                          </td>
                          <td className="py-2.5 px-3 max-w-xs truncate text-slate-700 font-medium">
                            {item.description}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase border ${statusBadges[selectedStack.primary.status] || statusBadges.Open}`}>
                              {selectedStack.primary.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 p-4 border-t border-slate-300 flex items-center justify-end shrink-0">
              <button
                onClick={() => setSelectedStack(null)}
                className="bg-[#064e3b] hover:bg-[#00401a] text-white px-5 py-2 text-xs font-extrabold uppercase border border-emerald-400 shadow-sm cursor-pointer"
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

export default AdminDuplicates;
