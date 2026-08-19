import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { SkeletonTable } from '../components/Loader';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import { Download, Printer, FileText, Filter, X, ArrowUpDown, ArrowUp, ArrowDown, Building2 } from 'lucide-react';

const AdminReports = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [filters, setFilters] = useState({
    city: '',
    category: '',
    status: '',
    province: ''
  });
  
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // PRINT CONFIG MODAL STATE
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printConfig, setPrintConfig] = useState({
    city: '',
    category: '',
    priority: '',
    status: '',
    department: '',
    startDate: '',
    endDate: ''
  });

  const cities = ['Karachi', 'Lahore', 'Hyderabad', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'];
  const categories = ['Road', 'Water', 'Waste', 'Electricity', 'Drainage', 'Safety', 'Other'];
  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  const statuses = ['Open', 'Assigned', 'In Progress', 'Resolved'];
  const departments = [
    'PWD Road Infrastructure Dept',
    'WASMO & Water Board',
    'Solid Waste Management Authority',
    'K-Electric / WAPDA Division',
    'Sewerage & Drainage Wing',
    'Traffic & Municipal Police Division',
    'General Municipal Administration'
  ];

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Freeze page scroll when Print Config modal is open
  useEffect(() => {
    if (isPrintModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPrintModalOpen]);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(Array.isArray(res.data) ? res.data : (res.data.complaints || []));
    } catch (e) {
      console.error('Failed to fetch complaints for reports:', e);
      toast.error('Failed to fetch report records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filtered = complaints.filter(c => {
    return (!filters.city || c.city === filters.city) &&
      (!filters.category || c.category === filters.category) &&
      (!filters.status || c.status === filters.status) &&
      (!filters.province || c.province === filters.province);
  });

  const sortedComplaints = [...filtered].sort((a, b) => {
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
    if (sortField === 'category') {
      return sortOrder === 'asc' ? (a.category || '').localeCompare(b.category || '') : (b.category || '').localeCompare(a.category || '');
    }
    if (sortField === 'id') {
      return sortOrder === 'asc' ? (a._id || '').localeCompare(b._id || '') : (b._id || '').localeCompare(a._id || '');
    }
    return 0;
  });

  // Filter complaints specifically for custom Print modal selection
  const printableComplaints = complaints.filter(c => {
    const matchesCity = !printConfig.city || c.city === printConfig.city;
    const matchesCat = !printConfig.category || c.category === printConfig.category;
    const matchesPri = !printConfig.priority || c.priority === printConfig.priority;
    const matchesStat = !printConfig.status || c.status === printConfig.status;
    const matchesDept = !printConfig.department || 
      (c.assignedDepartment || '').toLowerCase().includes(printConfig.department.toLowerCase()) ||
      printConfig.department.toLowerCase().includes((c.assignedDepartment || '').toLowerCase());

    const cTime = new Date(c.createdAt || Date.now()).getTime();
    const matchesStart = !printConfig.startDate || cTime >= new Date(printConfig.startDate).getTime();
    const matchesEnd = !printConfig.endDate || cTime <= new Date(printConfig.endDate).getTime() + (24 * 3600 * 1000);

    return matchesCity && matchesCat && matchesPri && matchesStat && matchesDept && matchesStart && matchesEnd;
  });

  // Export CSV Handler
  const exportToCSV = () => {
    if (sortedComplaints.length === 0) {
      toast.warning('No records to export.');
      return;
    }

    const headers = ['Ref ID', 'Citizen Name', 'CNIC', 'City', 'Province', 'Category', 'Priority', 'Status', 'Department', 'Date'];
    const rows = sortedComplaints.map(c => [
      `CMP-${String(c._id).slice(-4).toUpperCase()}`,
      `"${c.citizenName || 'Civic Citizen'}"`,
      `"${c.cnic || 'N/A'}"`,
      `"${c.city || ''}"`,
      `"${c.province || ''}"`,
      `"${c.category || ''}"`,
      `"${c.priority || ''}"`,
      `"${c.status || ''}"`,
      `"${c.assignedDepartment || ''}"`,
      `"${new Date(c.createdAt || Date.now()).toLocaleDateString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CivicPak_Grievances_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Official CSV Report exported successfully.');
  };

  // Trigger Actual Document Print
  const triggerActualPrint = () => {
    setIsPrintModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const priorityBadges = {
    Critical: 'bg-rose-600 text-white border-rose-400 font-black',
    High: 'bg-amber-500 text-white border-amber-300 font-bold',
    Medium: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    Low: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-50" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-emerald-300" /> : <ArrowDown size={12} className="text-emerald-300" />;
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 print-area">
      {/* PRINT-ONLY CONTAINER (Renders ONLY printableComplaints with OFFICIAL WEBSITE LOGO) */}
      <div className="hidden print:block print-document-wrapper">
        <div className="mb-6 text-center border-b-4 border-[#064e3b] pb-4 flex flex-col items-center justify-center">
          <div className="mb-2">
            <Logo size="lg" />
          </div>
          <h2 className="text-xl font-black uppercase text-slate-900 tracking-wider">
            GOVERNMENT OF PAKISTAN MUNICIPAL AUDIT REPORT
          </h2>
          <p className="text-xs text-slate-600 font-mono font-bold mt-1">
            Official Public Grievances Summary • Printed: {new Date().toLocaleDateString()} • Total Records: {printableComplaints.length}
          </p>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#064e3b] text-white border-b-2 border-emerald-500 font-mono uppercase text-[10px]">
              <th className="py-2 px-3">Ref ID</th>
              <th className="py-2 px-3">Citizen & CNIC</th>
              <th className="py-2 px-3">City & Province</th>
              <th className="py-2 px-3">Category</th>
              <th className="py-2 px-3">Priority</th>
              <th className="py-2 px-3">Department</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Date Filed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {printableComplaints.map(c => (
              <tr key={c._id}>
                <td className="py-2 px-3 font-mono font-bold text-[#064e3b]">
                  CMP-{String(c._id).slice(-4).toUpperCase()}
                </td>
                <td className="py-2 px-3 font-bold text-slate-900">
                  {c.citizenName || 'Civic Citizen'} ({c.cnic || 'N/A'})
                </td>
                <td className="py-2 px-3 font-bold text-slate-800">
                  {c.city || 'Karachi'}, {c.province || 'Sindh'}
                </td>
                <td className="py-2 px-3 font-bold text-slate-900">{c.category}</td>
                <td className="py-2 px-3 font-bold">{c.priority}</td>
                <td className="py-2 px-3 font-mono text-xs">{c.assignedDepartment || 'General Admin'}</td>
                <td className="py-2 px-3 font-bold uppercase">{c.status}</td>
                <td className="py-2 px-3 font-mono">
                  {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Screen Header (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-emerald-700 pb-3 print:hidden">
        <div>
          <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <FileText size={24} className="text-[#064e3b]" /> Municipal Officer Reports & Data Export
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Generate, sort, and export official CSV records & printable summaries for government archives
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={exportToCSV}
            disabled={sortedComplaints.length === 0}
            className="flex items-center gap-1.5 bg-[#064e3b] hover:bg-[#00401a] text-white px-4 py-2 text-xs font-bold uppercase border border-emerald-500 transition-all shadow-sm"
          >
            <Download size={15} /> Export CSV Data
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-bold uppercase border border-slate-600 transition-all shadow-sm"
          >
            <Printer size={15} /> Print Summary Report
          </button>
        </div>
      </div>

      {/* Filters Bar (Hidden when printing) */}
      <div className="bg-white p-4 border-2 border-slate-300 space-y-3 print:hidden">
        <div className="text-xs font-black uppercase text-slate-500 border-b border-slate-200 pb-1 flex justify-between">
          <span>Report Filtering Parameters</span>
          {(filters.city || filters.category || filters.status || filters.province) && (
            <button
              onClick={() => {
                setFilters({ city: '', category: '', status: '', province: '' });
                setSortField('date');
                setSortOrder('desc');
              }}
              className="text-[11px] font-bold text-rose-700 hover:underline uppercase"
            >
              Reset Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={filters.city}
            onChange={e => setFilters({ ...filters, city: e.target.value })}
            className="bg-slate-50 border border-slate-300 p-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
          >
            <option value="">All Municipal Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value })}
            className="bg-slate-50 border border-slate-300 p-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
          >
            <option value="">All Issue Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="bg-slate-50 border border-slate-300 p-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
          >
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div className="flex items-center justify-end font-mono text-xs font-bold text-[#064e3b] bg-emerald-50 px-3 border border-emerald-300">
            Records Found: {sortedComplaints.length}
          </div>
        </div>
      </div>

      {/* Reports Table with Clickable Table Header Sorting (Hidden when printing) */}
      <div className="bg-white border-2 border-slate-300 overflow-hidden print:hidden">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={8} /></div>
        ) : sortedComplaints.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold uppercase text-xs">
            No report records match the selected parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#064e3b] text-white border-b-2 border-emerald-500 font-mono uppercase text-[10px] select-none">
                  <th
                    onClick={() => handleSortToggle('id')}
                    className="py-3 px-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      Ref ID {renderSortIcon('id')}
                    </div>
                  </th>
                  <th className="py-3 px-4">Citizen & CNIC</th>
                  <th className="py-3 px-4">City & Province</th>
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
                      Priority {renderSortIcon('priority')}
                    </div>
                  </th>
                  <th className="py-3 px-4">Department</th>
                  <th
                    onClick={() => handleSortToggle('status')}
                    className="py-3 px-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      Status {renderSortIcon('status')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortToggle('date')}
                    className="py-3 px-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      Date Filed {renderSortIcon('date')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedComplaints.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#064e3b]">
                      CMP-{String(c._id).slice(-4).toUpperCase()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {c.citizenName || 'Civic Citizen'}
                      <div className="text-[10px] font-mono text-slate-500 font-normal">{c.cnic || 'N/A'}</div>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">
                      {c.city || 'Karachi'}
                      <div className="text-[10px] text-slate-500 font-normal">{c.province || 'Sindh'}</div>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{c.category}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold border ${priorityBadges[c.priority] || priorityBadges.Medium}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-slate-700">{c.assignedDepartment || 'General Admin'}</td>
                    <td className="py-2.5 px-4">
                      <span className="bg-slate-100 border border-slate-300 text-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DEDICATED PRINT SUMMARY CONFIG MODAL (RENDERED VIA CREATEPORTAL AT DOCUMENT.BODY LEVEL) */}
      {isPrintModalOpen && createPortal(
        <div
          onClick={() => setIsPrintModalOpen(false)}
          className="fixed top-0 left-0 w-screen h-screen inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden print:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-4 border-[#064e3b] max-w-xl w-full p-6 space-y-5 shadow-2xl relative animate-modal-pop text-slate-900"
          >
            <button
              onClick={() => setIsPrintModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-1 border border-slate-300"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="border-b-2 border-slate-200 pb-3">
              <h3 className="text-base font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                <Printer size={18} className="text-[#064e3b]" /> Custom Print Report Configuration
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Select target municipal parameters before generating official printable summary
              </p>
            </div>

            {/* Config Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* City Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase block text-[11px]">Select Target City:</label>
                <select
                  value={printConfig.city}
                  onChange={e => setPrintConfig(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">All Municipal Cities</option>
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Category Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase block text-[11px]">Select Issue Category:</label>
                <select
                  value={printConfig.category}
                  onChange={e => setPrintConfig(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">All Issue Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Priority Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase block text-[11px]">Priority Level Filter:</label>
                <select
                  value={printConfig.priority}
                  onChange={e => setPrintConfig(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">All Priority Levels</option>
                  {priorities.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase block text-[11px]">Status Filter:</label>
                <select
                  value={printConfig.status}
                  onChange={e => setPrintConfig(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">All Statuses</option>
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Department Selection */}
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700 uppercase block text-[11px]">Municipal Department:</label>
                <select
                  value={printConfig.department}
                  onChange={e => setPrintConfig(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Start */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase block text-[11px]">From Date:</label>
                <input
                  type="date"
                  value={printConfig.startDate}
                  onChange={e => setPrintConfig(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 p-2 font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Date Range End */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase block text-[11px]">To Date:</label>
                <input
                  type="date"
                  value={printConfig.endDate}
                  onChange={e => setPrintConfig(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 p-2 font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Print Selection Summary Box */}
            <div className="bg-[#064e3b] text-white p-3 border border-emerald-500 text-xs flex items-center justify-between font-mono">
              <span>Target Records Matching Print Filter:</span>
              <span className="font-black text-amber-300 text-sm">{printableComplaints.length} Records</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                onClick={() => setPrintConfig({ city: '', category: '', priority: '', status: '', department: '', startDate: '', endDate: '' })}
                className="text-xs font-bold text-rose-700 hover:underline uppercase"
              >
                Reset Print Config
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 text-xs font-bold uppercase border border-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={triggerActualPrint}
                  disabled={printableComplaints.length === 0}
                  className="bg-[#064e3b] hover:bg-[#00401a] text-white px-5 py-2 text-xs font-extrabold uppercase flex items-center gap-1.5 border border-emerald-400 shadow-sm"
                >
                  <Printer size={15} /> Print Official Document ({printableComplaints.length})
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminReports;
