import React, { useMemo } from 'react';
import {
  FileText,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Complaint, PriorityLevel } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';

interface OverviewPageProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigateToTab: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  complaints,
  onSelectComplaint,
  onNavigateToTab,
}) => {
  // Key Metric Aggregations
  const total = complaints.length;
  const pending = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const critical = complaints.filter(
    (c) => c.priority === 'Critical' && c.status !== 'Resolved'
  ).length;

  // Complaints by Category for Pie Chart
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  // Priority Distribution for Bar Chart
  const priorityData = useMemo(() => {
    const counts: Record<PriorityLevel, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };
    complaints.forEach((c) => {
      if (counts[c.priority] !== undefined) {
        counts[c.priority]++;
      }
    });
    return [
      { name: 'Critical', count: counts.Critical, fill: '#ef4444' },
      { name: 'High', count: counts.High, fill: '#f97316' },
      { name: 'Medium', count: counts.Medium, fill: '#3b82f6' },
      { name: 'Low', count: counts.Low, fill: '#10b981' },
    ];
  }, [complaints]);

  // Realistic 14-day trend data
  const trendData = useMemo(() => {
    const days = [
      'Oct 17', 'Oct 18', 'Oct 19', 'Oct 20', 'Oct 21', 'Oct 22', 'Oct 23',
      'Oct 24', 'Oct 25', 'Oct 26', 'Oct 27', 'Oct 28', 'Oct 29', 'Oct 30',
    ];
    return days.map((day, i) => ({
      day,
      reported: 3 + Math.floor(Math.sin(i * 0.8) * 2 + (i % 3)),
      resolved: 2 + Math.floor(Math.cos(i * 0.7) * 2 + (i % 2)),
    }));
  }, []);

  const CATEGORY_COLORS = [
    '#0f766e', // Teal
    '#2563eb', // Blue
    '#d97706', // Amber
    '#e11d48', // Rose
    '#059669', // Emerald
    '#7c3aed', // Purple
    '#ea580c', // Orange
    '#475569', // Slate
  ];

  const recentComplaints = complaints.slice(0, 6);
  const criticalAlerts = complaints.filter(
    (c) => c.priority === 'Critical' && c.status !== 'Resolved'
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Municipal Command & Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time urban telemetry, AI triage queues, and infrastructure response tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateToTab('report')}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Citizen Portal Test</span>
          </button>
          <button
            onClick={() => onNavigateToTab('actions')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Manage Action Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* High-Priority Urgent Action Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-900">
                  Critical Hazard Alert: {criticalAlerts.length} Incident(s) Require Emergency Action
                </h3>
                <span className="text-[10px] font-mono bg-rose-200/80 text-rose-800 px-2 py-0.5 rounded font-semibold">
                  Tier 0 Priority
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5">
                Top issue: <strong className="font-semibold">{criticalAlerts[0]?.title}</strong> in{' '}
                {criticalAlerts[0]?.location.locality} (SLA remaining:{' '}
                {criticalAlerts[0]?.aiAnalysis.slaHours}h).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectComplaint(criticalAlerts[0])}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
            >
              <span>Instant AI Triage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateToTab('hotspots')}
              className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-medium rounded-lg transition-colors"
            >
              View on Map
            </button>
          </div>
        </div>
      )}

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Complaints */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Complaints
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span className="text-emerald-700 font-medium">+12%</span>
            <span>vs previous week</span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Pending Triage
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 tracking-tight">
            {pending}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Awaiting department route</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-teal-700 tracking-tight">
            {inProgress}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Field teams active on site</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Resolved
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {resolved}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            <span>{Math.round((resolved / (total || 1)) * 100)}% resolution rate</span>
          </div>
        </div>

        {/* Critical Priority Issues */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-rose-200 shadow-sm hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-rose-700">
              Critical Alerts
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 tracking-tight">
            {critical}
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">
            <span>Requires &lt; 8h SLA action</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Complaints Intake vs Resolution Velocity
              </h3>
              <p className="text-xs text-slate-500">
                Daily volume reported versus closed over the past 14 days
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                <span className="text-slate-600">Reported</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" />
                <span className="text-slate-600">Resolved</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="reported" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" name="Reported" />
                <Area type="monotone" dataKey="resolved" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart (1 Col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Complaints by Civic Category
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              Relative load across municipal operational domains
            </p>
          </div>

          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-900">{total}</span>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Reports</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600 mt-2 max-h-24 overflow-y-auto">
            {categoryData.slice(0, 6).map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                />
                <span className="truncate">{c.name} ({c.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Distribution & AI Explainability Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Priority Distribution (AI Calibrated)
            </h3>
            <p className="text-xs text-slate-500">
              Automated safety urgency assessment
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainable AI Highlight Panel */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Autonomous Triage & Hotspot Intelligence
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-700/50">
                Explainable AI Active
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              CivicAI evaluates multimodal citizen submissions, calculating infrastructure risk,
              synthesizing duplicate reports within 800m, and routing directly to accountable municipal
              officers with SLA contracts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-700">
                <div className="text-[10px] text-teal-400 uppercase font-semibold">
                  Duplicate Deduplication
                </div>
                <div className="text-base font-bold text-white mt-0.5">85% Reduced</div>
                <div className="text-[11px] text-slate-400">Merged multi-citizen reports</div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-700">
                <div className="text-[10px] text-teal-400 uppercase font-semibold">
                  Mean SLA Response
                </div>
                <div className="text-base font-bold text-white mt-0.5">4.2 Hours</div>
                <div className="text-[11px] text-slate-400">On critical safety hazards</div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-700">
                <div className="text-[10px] text-teal-400 uppercase font-semibold">
                  Hotspot Clustering
                </div>
                <div className="text-base font-bold text-white mt-0.5">4 Active Zones</div>
                <div className="text-[11px] text-slate-400">Indiranagar, ORR, Whitefield</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-700 text-xs text-slate-400">
            <span>Model trained on Indian Municipal Corporation SOPs</span>
            <button
              onClick={() => onNavigateToTab('ai-insights')}
              className="text-teal-300 hover:text-teal-200 font-semibold flex items-center gap-1"
            >
              <span>Explore AI Insights</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Citizen Complaints
            </h3>
            <p className="text-xs text-slate-500">
              Live feed of newly submitted and triaged municipal reports
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('complaints')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>View All ({complaints.length})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Problem Statement</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Locality</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentComplaints.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectComplaint(item)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                    {item.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                    {item.title}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {item.category}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.location.locality}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={item.priority} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComplaint(item);
                      }}
                      className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition-colors"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
