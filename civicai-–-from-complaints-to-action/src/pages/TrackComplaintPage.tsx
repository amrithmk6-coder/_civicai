import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Shield,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';

interface TrackComplaintPageProps {
  complaints: Complaint[];
  selectedComplaintId?: string | null;
  onNavigateToTab: (tab: string) => void;
}

export const TrackComplaintPage: React.FC<TrackComplaintPageProps> = ({
  complaints,
  selectedComplaintId = null,
  onNavigateToTab,
}) => {
  const [inputId, setInputId] = useState(selectedComplaintId || 'CIV-2026-1042');
  const [searchedComplaint, setSearchedComplaint] = useState<Complaint | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle tracking lookup
  const handleSearch = (idToSearch: string) => {
    const clean = idToSearch.trim().toUpperCase();
    if (!clean) {
      setErrorMsg('Please enter a valid Complaint ID (e.g. CIV-2026-1042).');
      return;
    }
    const found = complaints.find(
      (c) => c.id.toUpperCase() === clean || c.id.toUpperCase().endsWith(clean)
    );
    if (found) {
      setSearchedComplaint(found);
      setErrorMsg('');
    } else {
      setErrorMsg(`No complaint found with Reference ID "${idToSearch}". Please check the ID.`);
      setSearchedComplaint(null);
    }
  };

  useEffect(() => {
    if (selectedComplaintId) {
      setInputId(selectedComplaintId);
      handleSearch(selectedComplaintId);
    } else {
      handleSearch('CIV-2026-1042');
    }
  }, [selectedComplaintId, complaints]);

  const statusSteps: ComplaintStatus[] = [
    'Submitted',
    'Under Review',
    'Assigned',
    'In Progress',
    'Resolved',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Public Grievance Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Track the live resolution lifecycle of your civic issue across all municipal divisions
        </p>
      </div>

      {/* Search Bar Box */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(inputId);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputId}
              onChange={(e) => {
                setInputId(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Enter Complaint ID (e.g., CIV-2026-1042)"
              className="w-full pl-11 pr-4 py-3 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all uppercase"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer shrink-0"
          >
            Track Status
          </button>
        </form>

        {/* Quick Sample IDs to Test */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Quick Test IDs:</span>
          {['CIV-2026-1042', 'CIV-2026-1010', 'CIV-2026-0731', 'CIV-2026-0850'].map((sampleId) => (
            <button
              key={sampleId}
              type="button"
              onClick={() => {
                setInputId(sampleId);
                handleSearch(sampleId);
              }}
              className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
            >
              {sampleId}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Searched Complaint Tracking Details */}
      {searchedComplaint && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-extrabold bg-slate-100 text-slate-900 px-3 py-1 rounded-lg border border-slate-200">
                  {searchedComplaint.id}
                </span>
                <StatusBadge status={searchedComplaint.status} size="md" />
                <PriorityBadge priority={searchedComplaint.priority} size="md" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 mt-2 leading-snug">
                {searchedComplaint.title}
              </h2>
            </div>

            <div className="text-right sm:self-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                SLA Compliance Target
              </span>
              <span className="text-sm font-bold text-teal-700">
                {searchedComplaint.aiAnalysis.slaHours} Hours Standard
              </span>
            </div>
          </div>

          {/* Lifecycle Progress Stepper */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Real-Time Progress Stepper
            </div>

            <div className="flex items-center justify-between relative">
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
              {statusSteps.map((st, idx) => {
                const currentIndex = statusSteps.indexOf(searchedComplaint.status);
                const isPassed = idx <= currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                  <div key={st} className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-slate-900 text-white ring-4 ring-slate-100 shadow-sm'
                          : 'bg-white text-slate-400 border border-slate-300'
                      } ${isCurrent ? 'ring-teal-500/30 ring-4' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] mt-2 font-medium ${
                        isCurrent
                          ? 'text-teal-700 font-bold'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4 Details Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block mb-1">
                Reported Date
              </span>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {new Date(searchedComplaint.submittedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block mb-1">
                Category
              </span>
              <span className="text-xs font-bold text-slate-800 block">
                {searchedComplaint.category}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block mb-1">
                Assigned Department
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block">
                {searchedComplaint.department || 'Awaiting Routing'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block mb-1">
                Responsible Officer
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block">
                {searchedComplaint.assignedOfficer?.name || 'Assigned to Beat Desk'}
              </span>
            </div>
          </div>

          {/* Official Resolution Remarks if Resolved */}
          {searchedComplaint.resolutionRemarks && (
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Official Municipal Resolution Statement
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-sans">
                {searchedComplaint.resolutionRemarks}
              </p>
              {searchedComplaint.resolvedAt && (
                <div className="text-[11px] text-emerald-700 mt-2 font-medium">
                  Verified closed on {new Date(searchedComplaint.resolvedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Timeline Audit Log */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Progress Timeline & Field Updates ({searchedComplaint.timeline.length})
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {searchedComplaint.timeline.map((evt) => (
                <div key={evt.id} className="relative">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-white ring-2 ring-slate-100" />
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        {evt.title}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(evt.timestamp).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">
                      {evt.description}
                    </p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{evt.actor}</span>
                      <span className="text-slate-300">·</span>
                      <span className="bg-slate-200 px-1.5 py-0.2 rounded text-[10px] font-medium text-slate-700">
                        {evt.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
