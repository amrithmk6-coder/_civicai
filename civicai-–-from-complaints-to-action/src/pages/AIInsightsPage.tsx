import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  AlertTriangle,
  TrendingUp,
  BrainCircuit,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Flame,
  FileCheck,
  Search,
} from 'lucide-react';
import { Complaint, HotspotCluster } from '../types';
import { AIAnalysisCard } from '../components/common/AIAnalysisCard';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';

interface AIInsightsPageProps {
  complaints: Complaint[];
  clusters: HotspotCluster[];
  selectedComplaint: Complaint | null;
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigateToTab: (tab: string) => void;
}

export const AIInsightsPage: React.FC<AIInsightsPageProps> = ({
  complaints,
  clusters,
  selectedComplaint,
  onSelectComplaint,
  onNavigateToTab,
}) => {
  // If no complaint is explicitly pre-selected, select the first critical one by default
  const [activeComplaintId, setActiveComplaintId] = useState<string>(
    selectedComplaint?.id ||
      complaints.find((c) => c.priority === 'Critical')?.id ||
      complaints[0]?.id ||
      ''
  );

  const [searchFilter, setSearchFilter] = useState('');

  const currentComplaint =
    complaints.find((c) => c.id === activeComplaintId) || complaints[0];

  const filteredComplaintList = complaints.filter(
    (c) =>
      c.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.location.locality.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Insights & Explainable Triage Engine
            </h1>
            <span className="text-[11px] font-mono bg-teal-950 text-teal-300 border border-teal-700/50 px-2 py-0.5 rounded font-semibold">
              Simulated AI v2.4
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Autonomous multi-signal complaint comprehension, duplicate clustering, and root-cause analysis
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('hotspots')}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <MapPin className="w-3.5 h-3.5 text-teal-400" />
          <span>Interactive Hotspot Map</span>
        </button>
      </div>

      {/* AI Executive Action Briefs (Top Intelligence Card) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 rounded-xl border border-slate-700 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold tracking-wide">
              AI Municipal Intelligence Brief & Anomaly Detection
            </h3>
          </div>
          <span className="text-[10px] text-teal-300 font-mono uppercase bg-teal-950 px-2 py-0.5 rounded border border-teal-700">
            Updated Hourly
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-700/80">
            <div className="flex items-center gap-2 font-bold text-teal-300 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Drainage & Waterlogging Hotspot Alert</span>
            </div>
            <p className="leading-relaxed">
              &quot;Multiple drainage and waterlogging complaints (4 reports) have been clustered in the Indiranagar 100 Feet Road corridor within an 800m radius. Root cause analysis points to culvert siltation choke at 12th Main junction. Immediate heavy-duty desilting and culvert flushing is recommended.&quot;
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-700/80">
            <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Emerging Infrastructure Hazard Forecast</span>
            </div>
            <p className="leading-relaxed">
              &quot;Outer Ring Road (Bellandur corridor) exhibits an accelerating rate of structural pothole formation (+60% this week) directly downstream of flyover storm drains. High collision probability for two-wheelers during evening peak hours. Overnight milling and asphalt overlay recommended.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Interface: Left: Interactive Selector, Right: Dedicated AI Analysis Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 4 Cols: Complaint Selection List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select Incident to Triage
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Click any complaint to inspect its full AI explainability model
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by ID, category, area..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Complaint Items List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredComplaintList.map((c) => {
              const isSelected = c.id === currentComplaint?.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveComplaintId(c.id);
                    onSelectComplaint(c);
                  }}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-teal-500/40'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isSelected ? 'text-teal-400' : 'text-slate-700'
                      }`}
                    >
                      {c.id}
                    </span>
                    <PriorityBadge priority={c.priority} size="sm" />
                  </div>

                  <div
                    className={`text-xs font-semibold line-clamp-1 ${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {c.title}
                  </div>

                  <div
                    className={`text-[11px] mt-1 flex items-center justify-between ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    <span>📍 {c.location.locality}</span>
                    <span>{c.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Full Explainable AI Diagnostic Card */}
        <div className="lg:col-span-8 space-y-4">
          {currentComplaint ? (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Active Incident Under Analysis
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    {currentComplaint.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{currentComplaint.id}</span>
                    <span>·</span>
                    <span>{currentComplaint.location.address}</span>
                    <span>·</span>
                    <span>Reported by {currentComplaint.citizen.name}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectComplaint(currentComplaint)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <span>Admin Action Modal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Core AI Analysis Display Card */}
              <AIAnalysisCard
                analysis={currentComplaint.aiAnalysis}
                complaintId={currentComplaint.id}
                onSelectRelatedId={(relatedId) => {
                  const target = complaints.find((c) => c.id === relatedId);
                  if (target) {
                    setActiveComplaintId(target.id);
                    onSelectComplaint(target);
                  }
                }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              Select a complaint from the left panel to inspect AI analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
