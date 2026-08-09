import { useState, useEffect } from 'react';
import api from '../api/axios';
import { SkeletonTable } from '../components/Loader';
import { useToast } from '../context/ToastContext';
import { Download, Printer, FileText, Filter, Calendar, MapPin, Building2, CheckCircle2, Loader2 } from 'lucide-react';

const AdminReports = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    city: '',
    category: '',
    status: '',
    province: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

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

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'];
  const categories = ['Road', 'Water', 'Waste', 'Electricity', 'Drainage', 'Safety', 'Other'];
  const statuses = ['Open', 'Assigned', 'In Progress', 'Resolved'];

  const filtered = complaints.filter(c => {
    return (!filters.city || c.city === filters.city) &&
      (!filters.category || c.category === filters.category) &&
      (!filters.status || c.status === filters.status) &&
      (!filters.province || c.province === filters.province);
  });

  // Export CSV Handler
  const exportToCSV = () => {
    if (filtered.length === 0) {
      toast.warning('No records to export.');
      return;
    }

    const headers = ['Grievance ID,Citizen Name,CNIC,Phone,Province,City,Address,Category,Priority,Status,Assigned Department,Date,Officer Remarks'];
    const rows = filtered.map(c => {
      const idStr = `CMP-${String(c._id).slice(-4).toUpperCase()}`;
      const name = `"${(c.citizenName || 'Civic Citizen').replace(/"/g, '""')}"`;
      const cnic = `"${c.cnic || 'N/A'}"`;
      const phone = `"${c.phone || 'N/A'}"`;
      const prov = `"${c.province || 'Sindh'}"`;
      const city = `"${c.city || 'Karachi'}"`;
      const addr = `"${(c.addressLine1 || c.location || '').replace(/"/g, '""')}"`;
      const cat = `"${c.category}"`;
      const pri = `"${c.priority}"`;
      const stat = `"${c.status}"`;
      const dept = `"${c.assignedDepartment || 'General Admin'}"`;
      const date = `"${new Date(c.createdAt || c.date).toLocaleDateString()}"`;
      const remarks = `"${(c.resolutionNotes || '').replace(/"/g, '""')}"`;

      return [idStr, name, cnic, phone, prov, city, addr, cat, pri, stat, dept, date, remarks].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CIVICPAK_Municipal_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filtered.length} records to CSV!`);
  };

  // Print Summary Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-emerald-700 pb-3">
        <div>
          <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <FileText size={24} className="text-[#064e3b]" /> Municipal Officer Reports & Data Export
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Generate and export official CSV records & printable summaries for government archives
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 bg-[#064e3b] hover:bg-[#00401a] text-white px-4 py-2 text-xs font-bold uppercase border border-emerald-500 transition-all shadow-sm"
          >
            <Download size={15} /> Export CSV Data
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-bold uppercase border border-slate-600 transition-all shadow-sm"
          >
            <Printer size={15} /> Print Summary Report
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 border-2 border-slate-300 space-y-3 print:hidden">
        <div className="text-xs font-black uppercase text-slate-500 border-b border-slate-200 pb-1">
          Report Filtering Parameters
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
            <option value="">All Resolution Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            onClick={() => setFilters({ city: '', category: '', status: '', province: '' })}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 p-2 text-xs font-bold uppercase border border-slate-400"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Official Government Printable Header */}
      <div className="hidden print:block bg-white p-6 border-b-2 border-slate-900 text-center space-y-2">
        <h2 className="text-xl font-black uppercase text-slate-900">Government of Pakistan</h2>
        <h3 className="text-sm font-bold text-slate-700 uppercase">National Public Grievance Redressal Authority — Official Record</h3>
        <p className="text-xs text-slate-500 font-mono">Generated Date: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white border-2 border-slate-300 overflow-hidden">
        {loading ? (
          <SkeletonTable rows={5} />
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-xs font-semibold text-slate-600">
            No grievance records found matching selected report filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#064e3b] text-white uppercase tracking-wider font-extrabold border-b-2 border-emerald-500">
                <tr>
                  <th className="py-3 px-4">Grievance ID</th>
                  <th className="py-3 px-4">Citizen Name & CNIC</th>
                  <th className="py-3 px-4">City & Province</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Dept</th>
                  <th className="py-3 px-4">Officer Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900">
                {filtered.map(c => {
                  const idStr = `CMP-${String(c._id).slice(-4).toUpperCase()}`;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-[#064e3b]">{idStr}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold">{c.citizenName || 'Civic Citizen'}</div>
                        <div className="text-[10px] font-mono text-slate-500">{c.cnic || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4 font-bold">{c.city || 'Karachi'}, {c.province || 'Sindh'}</td>
                      <td className="py-3 px-4 font-semibold">{c.category}</td>
                      <td className="py-3 px-4 font-bold">{c.status}</td>
                      <td className="py-3 px-4">{c.assignedDepartment || 'General Admin'}</td>
                      <td className="py-3 px-4 font-mono text-[11px] max-w-xs truncate">{c.resolutionNotes || 'Grievance logged'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
