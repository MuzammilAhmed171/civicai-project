import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Loader2, AlertCircle, MapPin, Calendar, Tag } from 'lucide-react';

import { SkeletonGrid } from '../components/Loader';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '', priority: '', status: '' });

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(Array.isArray(res.data) ? res.data : (res.data.complaints || []));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const filtered = complaints.filter((c) => {
    const matchSearch = !filters.search ||
      c.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      c.location?.toLowerCase().includes(filters.search.toLowerCase());
    return matchSearch && (!filters.category || c.category === filters.category)
      && (!filters.priority || c.priority === filters.priority)
      && (!filters.status || c.status === filters.status);
  });

  const statusColors = { Open: 'bg-blue-100 text-blue-700', Assigned: 'bg-indigo-100 text-indigo-700', 'In Progress': 'bg-amber-100 text-amber-700', Resolved: 'bg-green-100 text-green-700', Closed: 'bg-gray-100 text-gray-700' };
  const priorityColors = { Critical: 'text-red-600 bg-red-50', High: 'text-orange-600 bg-orange-50', Medium: 'text-amber-600 bg-amber-50', Low: 'text-green-600 bg-green-50' };
  const categories = ['Road', 'Water', 'Waste', 'Electricity', 'Drainage', 'Safety', 'Other'];
  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  const statuses = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Complaints</h1>
        <p className="text-gray-600">View and track all submitted civic complaints in real-time</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search complaints..." value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary" />
          </div>
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary bg-white">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary bg-white">
            <option value="">All Priorities</option>
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary bg-white">
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">Showing {filtered.length} of {complaints.length} complaints</span>
      </div>

      {loading ? (
        <SkeletonGrid count={3} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No complaints found</h3>
          <p className="text-gray-500">Try adjusting your filters or submit a new complaint.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((c, idx) => (
            <div key={c._id || c.complaint_id || idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      CMP-{String(c._id).slice(-4).toUpperCase()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityColors[c.priority] || priorityColors.Medium}`}>
                      {c.priority}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium mb-3 leading-relaxed">{c.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 text-gray-500"><Tag size={14} /> {c.category}</span>
                    <span className="inline-flex items-center gap-1 text-gray-500"><MapPin size={14} /> {c.location || 'General Area'}</span>
                    <span className="inline-flex items-center gap-1 text-gray-500"><Calendar size={14} /> {new Date(c.createdAt || c.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusColors[c.status] || statusColors.Open}`}>{c.status || 'Open'}</span>
                </div>
              </div>
              {(c.assignedDepartment || c.assigned_department) && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500 flex items-center justify-between">
                  <span>Assigned Department: <span className="font-medium text-gray-800">{c.assignedDepartment || c.assigned_department}</span></span>
                  {c.aiOutput?.confidence && (
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-md font-medium">
                      AI Confidence: {(c.aiOutput.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
