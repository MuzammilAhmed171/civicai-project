import { useState, useEffect } from 'react';
import api from '../api/axios';
import GlobalLoader from '../components/Loader';
import { useToast } from '../context/ToastContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Loader2, AlertTriangle, CheckCircle2, Clock, Inbox, Activity,
  Award, Building, MapPin, CopyCheck, FileText
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      if (res.data) setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      toast.error('Failed to load live analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const CITY_COLORS = ['#064e3b', '#047857', '#059669', '#10b981', '#34d399', '#0284c7', '#d97706'];
  const PRIORITY_COLORS = { Critical: '#dc2626', High: '#ea580c', Medium: '#d97706', Low: '#16a34a' };

  if (loading) {
    return <GlobalLoader message="Loading Municipal Executive Analytics..." />;
  }

  const summary = analytics || {};
  const total = summary.total || 0;
  const open = summary.open || 0;
  const assigned = summary.assigned || 0;
  const inProgress = summary.in_progress || 0;
  const resolved = summary.resolved || 0;
  const critical = summary.critical || 0;
  const duplicates = summary.duplicates || 0;

  const byCategory = summary.by_category || summary.byCategory || [];
  const byCity = summary.by_city || [];
  const byPriority = summary.by_priority || summary.byPriority || [];

  const insights = summary.insights || {
    most_common_category: 'N/A',
    most_common_city: 'N/A',
    highest_priority_category: 'N/A',
    resolution_rate: '0.0%'
  };

  const statCards = [
    { label: 'Total Registered', value: total, icon: Inbox, color: 'bg-[#064e3b]' },
    { label: 'Pending Inspection', value: open, icon: Clock, color: 'bg-amber-700' },
    { label: 'Field Execution', value: assigned + inProgress, icon: Activity, color: 'bg-[#047857]' },
    { label: 'Resolved & Closed', value: resolved, icon: CheckCircle2, color: 'bg-emerald-700' },
    { label: 'Critical Urgency', value: critical, icon: AlertTriangle, color: 'bg-rose-700' },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="border-b-2 border-emerald-700 pb-3 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">
            Municipal Inspector Executive Dashboard
          </h1>
          <p className="text-xs text-slate-600 font-medium">Real-time district grievance stats, regional distribution & field progress</p>
        </div>

        <div className="bg-[#064e3b] text-white px-3 py-1 text-xs font-mono font-bold">
          System Status: ACTIVE
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statCards.map((stat, i) => (
          <StatsCard key={i} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      {/* Executive Key Indicators */}
      <div className="bg-white p-5 border-2 border-slate-300 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-[#064e3b] border-b border-slate-200 pb-2">
          District Operations Key Indicators
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Top Grievance City</div>
            <div className="text-base font-black text-slate-900 mt-0.5">{insights.most_common_city}</div>
          </div>

          <div className="bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Primary Issue Category</div>
            <div className="text-base font-black text-slate-900 mt-0.5">{insights.most_common_category}</div>
          </div>

          <div className="bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Flagged Duplicates</div>
            <div className="text-base font-black text-amber-700 mt-0.5">{duplicates} Reports</div>
          </div>

          <div className="bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Resolution Efficiency</div>
            <div className="text-base font-black text-emerald-700 mt-0.5">{insights.resolution_rate}</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart 1 — City Breakdown */}
        <div className="bg-white p-5 border-2 border-slate-300">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex justify-between">
            <span>Complaints by City / District</span>
            <span className="font-mono text-emerald-800">City Breakdown</span>
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} />
              <YAxis tick={{ fontSize: 11, fill: '#334155' }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }} />
              <Bar dataKey="count">
                {byCity.map((_, i) => (
                  <Cell key={i} fill={CITY_COLORS[i % CITY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 — Category Breakdown */}
        <div className="bg-white p-5 border-2 border-slate-300">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex justify-between">
            <span>Complaints by Category</span>
            <span className="font-mono text-emerald-800">Category Breakdown</span>
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} />
              <YAxis tick={{ fontSize: 11, fill: '#334155' }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }} />
              <Bar dataKey="count" fill="#047857" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
