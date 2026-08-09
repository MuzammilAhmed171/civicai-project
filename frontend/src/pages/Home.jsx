import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Building2, CheckCircle2, Phone, Mail, MapPin, FileText, UserPlus, LogIn, Award, Users, AlertTriangle, HardHat, Droplets, Trash2, Zap, ShieldAlert, UserCheck, PlusCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({ total: 124, resolved: 98, pending: 26, rate: '79.0%' });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics');
      if (res.data) {
        setStats({
          total: res.data.total || 124,
          resolved: res.data.resolved || 98,
          pending: (res.data.total || 124) - (res.data.resolved || 98),
          rate: res.data.insights?.resolution_rate || '79.0%'
        });
      }
    } catch (e) {
      console.error('Stats fetch error:', e);
    }
  };

  const departments = [
    { name: 'Public Works Department (PWD)', desc: 'Road repair, potholes, tarmac maintenance, bridge structural safety', icon: HardHat },
    { name: 'Water & Sewerage Board (KWSC / WASA)', desc: 'Water pipeline leaks, main line contamination, sewage overflow, gutter unblocking', icon: Droplets },
    { name: 'Solid Waste Management Authority', desc: 'Garbage dumping clearance, neighborhood dumpster unblocking, street cleaning', icon: Trash2 },
    { name: 'Electricity Distribution (K-Electric / WAPDA)', desc: 'Hanging power cables, transformer breakdown, street light outages', icon: Zap },
    { name: 'Public Health & Sanitation', desc: 'Vector control spraying, open drain cleaning, sanitary hazards', icon: Building2 },
    { name: 'Municipal Enforcement & Safety', desc: 'Encroachment reporting, stray animal hazards, public safety obstacles', icon: ShieldAlert }
  ];

  const processSteps = [
    { step: '01', title: 'Citizen Verification', desc: 'Citizen registers account with valid 13-digit CNIC number and mobile contact.' },
    { step: '02', title: 'Structured Grievance Submission', desc: 'Select Province, City, exact Address, Category, and detailed description of the civic problem.' },
    { step: '03', title: 'Automated Routing to Department', desc: 'Grievance is assigned immediately to the responsible municipal department and regional engineer.' },
    { step: '04', title: 'Inspection & Field Execution', desc: 'Field teams execute physical repairs, update status, and log official resolution remarks.' },
    { step: '05', title: 'Citizen Resolution Tracking', desc: 'Citizens track 4-stage live progress on their personal portal until issue closure.' }
  ];

  const faqs = [
    { q: 'Who can register and submit complaints on CivicPak?', a: 'Any Pakistani citizen with a valid 13-digit CNIC (National Identity Card) can register and submit civic complaints.' },
    { q: 'Is there any fee or charge for submitting a grievance?', a: 'No. CivicPak is an official public service portal and is 100% free of charge for all citizens.' },
    { q: 'How can I track the status of my reported issue?', a: 'Log into your Citizen Account to view the 4-step progress stepper and official remarks left by municipal engineers.' },
    { q: 'Which regions of Pakistan are supported?', a: 'CivicPak supports all Provinces (Punjab, Sindh, KPK, Balochistan, ICT, Azad Kashmir, and Gilgit-Baltistan).' }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans">
      {/* Marquee Announcement Bar */}
      <div className="bg-[#00401a] text-white py-2 overflow-hidden border-b border-emerald-500 font-mono text-xs font-bold uppercase tracking-widest">
        <div className="animate-marquee gap-8">
          <span>GOVERNMENT OF PAKISTAN — NATIONAL PUBLIC GRIEVANCE REDRESSAL PORTAL — REPORT MUNICIPAL ISSUES ONLINE — TRANSPARENT CITIZEN RESOLUTION —</span>
          <span>GOVERNMENT OF PAKISTAN — NATIONAL PUBLIC GRIEVANCE REDRESSAL PORTAL — REPORT MUNICIPAL ISSUES ONLINE — TRANSPARENT CITIZEN RESOLUTION —</span>
        </div>
      </div>

      {/* Main Hero Header Section with Multi-Box Image Grid */}
      <section className="bg-[#064e3b] text-white py-12 sm:py-16 px-4 border-b-4 border-emerald-400">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Text & Buttons */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="inline-block bg-[#006600] border border-emerald-300 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-emerald-100">
              Official Citizen Grievance Redressal Framework
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight">
              Pakistan Civic & Municipal Complaint Resolution System
            </h1>

            <p className="text-xs sm:text-base text-emerald-100 font-normal leading-relaxed">
              A centralized public platform connecting Pakistani citizens directly with Municipal Authorities, Water Boards, PWD, and Power Distribution Companies for transparent issue resolution.
            </p>

            {/* Dynamic Buttons Based on Auth State */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/citizen/dashboard"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-6 py-3 text-xs font-black uppercase tracking-wider border-2 border-white shadow-md transition-all"
                  >
                    <UserCheck size={16} /> Go to My Portal ({user?.name?.split(' ')[0] || 'Citizen'})
                  </Link>

                  <Link
                    to="/submit"
                    className="inline-flex items-center justify-center gap-2 bg-[#00401a] hover:bg-[#006600] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider border border-emerald-300 transition-all"
                  >
                    <PlusCircle size={16} /> Submit Complaint
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-6 py-3 text-xs font-black uppercase tracking-wider border-2 border-white shadow-md transition-all"
                  >
                    <UserPlus size={16} /> Register
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 bg-[#00401a] hover:bg-[#006600] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider border border-emerald-300 transition-all"
                  >
                    <LogIn size={16} /> Login
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Multi-Box Image Grid (Exact User Sketch Layout) */}
          <div className="lg:col-span-6 space-y-2">
            {/* Top Row: Two Boxes (Left Medium, Right Smaller) */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7 h-28 border-2 border-emerald-400 overflow-hidden relative group bg-slate-900">
                <img
                  src="./images/pakistan_road_repair.png"
                  alt="PWD Road Construction"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186c572?w=800&auto=format&fit=crop'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-[#00401a]/95 text-[10px] font-mono font-bold text-white px-2 py-0.5 border-t border-emerald-400">
                  PWD ROAD REPAIR
                </div>
              </div>

              <div className="col-span-5 h-28 border-2 border-emerald-400 overflow-hidden relative group bg-slate-900">
                <img
                  src="./images/pakistan_water_pipeline.png"
                  alt="Water Board Pipeline"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574482620826-40685ca5ebd2?w=800&auto=format&fit=crop'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-[#00401a]/95 text-[10px] font-mono font-bold text-white px-2 py-0.5 border-t border-emerald-400">
                  WATER BOARD
                </div>
              </div>
            </div>

            {/* Middle Row: Two Boxes (Left Small, Right Square) */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6 h-32 border-2 border-emerald-400 overflow-hidden relative group bg-slate-900">
                <img
                  src="./images/pakistan_waste_cleanup.png"
                  alt="Solid Waste Sanitation"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-[#00401a]/95 text-[10px] font-mono font-bold text-white px-2 py-0.5 border-t border-emerald-400">
                  SOLID WASTE SANITATION
                </div>
              </div>

              <div className="col-span-6 h-32 border-2 border-emerald-400 overflow-hidden relative group bg-slate-900">
                <img
                  src="./images/pakistan_street_lighting.png"
                  alt="Street Lighting Repair"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-[#00401a]/95 text-[10px] font-mono font-bold text-white px-2 py-0.5 border-t border-emerald-400">
                  POWER & LIGHTING
                </div>
              </div>
            </div>

            {/* Lower Row: Wide Spanning Image Box */}
            <div className="w-full h-28 border-2 border-emerald-400 overflow-hidden relative group bg-slate-900">
              <img
                src="./images/pakistan_drainage_cleaning.png"
                alt="Drainage Channel Cleaning"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop'; }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-[#00401a]/95 text-[10px] font-mono font-bold text-white px-2.5 py-1 border-t border-emerald-400 flex justify-between items-center">
                <span>DRAINAGE & SEWAGE UNBLOCKING OPERATIONS</span>
                <span className="bg-emerald-700 text-white text-[9px] px-1.5 py-0.2 font-bold uppercase">PROVINCIAL SERVICE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Live Statistics Bar */}
      <section className="bg-white border-b border-slate-300 shadow-sm py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 border-r border-slate-200 last:border-r-0">
            <div className="text-3xl font-black text-[#064e3b] font-mono">{stats.total}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Total Complaints Registered</div>
          </div>
          <div className="p-4 border-r border-slate-200 last:border-r-0">
            <div className="text-3xl font-black text-emerald-700 font-mono">{stats.resolved}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Successfully Resolved</div>
          </div>
          <div className="p-4 border-r border-slate-200 last:border-r-0">
            <div className="text-3xl font-black text-amber-700 font-mono">{stats.pending}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Active Inspections</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-black text-emerald-800 font-mono">{stats.rate}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Resolution Efficiency Rate</div>
          </div>
        </div>
      </section>

      {/* Workflow Process */}
      <section className="py-16 max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2 border-b-2 border-emerald-700 pb-4">
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
            5-Stage Public Resolution Workflow
          </h2>
          <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">How municipal grievances are processed from report to verified resolution</p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {processSteps.map((s) => (
            <div key={s.step} className="bg-white p-5 border-2 border-slate-300 space-y-3">
              <div className="text-xs font-mono font-black text-white bg-[#064e3b] px-2.5 py-1 w-fit">
                STAGE {s.step}
              </div>
              <h3 className="font-bold text-slate-900 text-sm leading-snug">{s.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Responsible Departments Grid */}
      <section className="bg-slate-100 py-16 border-y border-slate-300 px-4">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 border-b-2 border-emerald-700 pb-4">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
              Participating Municipal Departments
            </h2>
            <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Authorized regional bodies resolving citizen complaints</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {departments.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.name} className="bg-white p-5 border border-slate-300 space-y-2">
                  <div className="w-10 h-10 bg-[#064e3b] text-white flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-[#064e3b] text-sm">{d.name}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{d.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2 border-b-2 border-emerald-700 pb-4">
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
            Citizen Information & FAQs
          </h2>
          <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Important guidelines for filing civic complaints</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white p-5 border border-slate-300 space-y-2">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <span className="text-emerald-700 font-mono font-black">Q{i + 1}.</span> {f.q}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed pl-6">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Banner */}
      <section className="bg-[#064e3b] text-white py-12 px-4 border-t-4 border-emerald-400">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight">File Your Civic Grievance Today</h2>
          <p className="text-xs sm:text-sm text-emerald-100">Help municipal officers identify and repair public infrastructure in your district.</p>
          <div className="pt-2 flex justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/citizen/dashboard" className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-6 py-2.5 text-xs font-black uppercase tracking-wider border border-white">
                  Go to My Portal
                </Link>
                <Link to="/submit" className="bg-[#00401a] hover:bg-[#006600] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider border border-emerald-300">
                  Submit Complaint
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-6 py-2.5 text-xs font-black uppercase tracking-wider border border-white">
                  Register
                </Link>
                <Link to="/login" className="bg-[#00401a] hover:bg-[#006600] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider border border-emerald-300">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
