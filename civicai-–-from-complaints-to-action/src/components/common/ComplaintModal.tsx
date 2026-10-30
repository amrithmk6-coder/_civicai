import React, { useState } from 'react';
import { Complaint, ComplaintStatus, Department } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { AIAnalysisCard } from './AIAnalysisCard';
import {
  X,
  MapPin,
  Calendar,
  User,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle2,
  Send,
  AlertCircle,
  Copy,
  ExternalLink,
  Phone,
  Mail,
} from 'lucide-react';

interface ComplaintModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus, remarks?: string) => void;
  onAssignDepartment: (
    id: string,
    department: Department,
    officerName: string,
    officerDesignation: string,
    officerPhone: string
  ) => void;
  onNavigateToTracking?: (id: string) => void;
  onSelectRelatedId?: (id: string) => void;
}

const DEPARTMENTS: Department[] = [
  'Roads & Infrastructure',
  'Drainage & Stormwater',
  'Sanitation & Solid Waste',
  'Electrical & Street Lighting',
  'Water Supply & Sewerage',
  'Public Safety & Vigilance',
  'Urban Forestry & Parks',
  'General Administration',
];

const DEFAULT_OFFICERS: Record<Department, { name: string; designation: string; phone: string }> = {
  'Roads & Infrastructure': {
    name: 'Er. H. Venkatesh',
    designation: 'Assistant Executive Engineer (Roads)',
    phone: '+91 94490-44119',
  },
  'Drainage & Stormwater': {
    name: 'Er. Rajeshwari Nair',
    designation: 'Assistant Executive Engineer (SWD)',
    phone: '+91 94480-11204',
  },
  'Sanitation & Solid Waste': {
    name: 'Shri Manjunath Swamy',
    designation: 'Senior Health Inspector (Solid Waste)',
    phone: '+91 94808-77112',
  },
  'Electrical & Street Lighting': {
    name: 'Er. Anand Prakash',
    designation: 'Assistant Engineer (Electrical)',
    phone: '+91 94483-33981',
  },
  'Water Supply & Sewerage': {
    name: 'Er. Pradeep Hegde',
    designation: 'Executive Engineer (Water Supply)',
    phone: '+91 94481-99234',
  },
  'Public Safety & Vigilance': {
    name: 'Inspector Vijay Bhaskar',
    designation: 'Civic Enforcement Inspector',
    phone: '+91 94480-22199',
  },
  'Urban Forestry & Parks': {
    name: 'Shri R. Chandrashekar',
    designation: 'Range Forest Officer',
    phone: '+91 94482-11883',
  },
  'General Administration': {
    name: 'Shri K. Muralidhar',
    designation: 'Ward Revenue Officer',
    phone: '+91 94480-10101',
  },
};

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onUpdateStatus,
  onAssignDepartment,
  onNavigateToTracking,
  onSelectRelatedId,
}) => {
  if (!isOpen || !complaint) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'ai' | 'action' | 'timeline'>('details');
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
  const [resolutionRemarks, setResolutionRemarks] = useState(complaint.resolutionRemarks || '');
  const [selectedDept, setSelectedDept] = useState<Department>(
    complaint.department || complaint.aiAnalysis.suggestedDepartment || 'Roads & Infrastructure'
  );
  const [officerName, setOfficerName] = useState(
    complaint.assignedOfficer?.name || DEFAULT_OFFICERS[selectedDept]?.name || 'Er. H. Venkatesh'
  );
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(complaint.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDeptChange = (dept: Department) => {
    setSelectedDept(dept);
    if (DEFAULT_OFFICERS[dept]) {
      setOfficerName(DEFAULT_OFFICERS[dept].name);
    }
  };

  const handleSaveStatus = () => {
    onUpdateStatus(complaint.id, selectedStatus, resolutionRemarks);
  };

  const handleSaveAssignment = () => {
    const officerInfo = DEFAULT_OFFICERS[selectedDept] || {
      designation: 'Lead Engineer',
      phone: '+91 94480-00000',
    };
    onAssignDepartment(
      complaint.id,
      selectedDept,
      officerName,
      officerInfo.designation,
      officerInfo.phone
    );
  };

  const statusProgression: ComplaintStatus[] = [
    'Submitted',
    'Under Review',
    'Assigned',
    'In Progress',
    'Resolved',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold bg-slate-200 text-slate-800 px-2.5 py-1 rounded">
              {complaint.id}
            </span>
            <button
              onClick={handleCopyId}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              title="Copy Complaint ID"
            >
              {copiedId ? (
                <span className="text-xs text-emerald-600 font-medium">Copied!</span>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <PriorityBadge priority={complaint.priority} size="sm" />
            <StatusBadge status={complaint.status} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToTracking && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToTracking(complaint.id);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-medium px-2.5 py-1 rounded bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                <span>Citizen Tracking View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Incident Overview
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            AI Diagnostic & Explainability
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'action'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Manage Action & Workflow
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Audit Trail ({complaint.timeline.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {complaint.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {complaint.location.address}, {complaint.location.locality} ({complaint.location.wardNumber})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Reported {new Date(complaint.submittedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Stepper Tracker */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                  Lifecycle Progress Stage
                </div>
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
                  {statusProgression.map((st, i) => {
                    const currentIndex = statusProgression.indexOf(complaint.status);
                    const isCompleted = i <= currentIndex;
                    const isCurrent = i === currentIndex;
                    return (
                      <div
                        key={st}
                        className="relative z-10 flex flex-col items-center text-center group"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                              : 'bg-white text-slate-400 border border-slate-300'
                          } ${isCurrent ? 'ring-teal-500/30 ring-4' : ''}`}
                        >
                          {isCompleted ? '✓' : i + 1}
                        </div>
                        <span
                          className={`text-[11px] mt-1.5 font-medium ${
                            isCurrent
                              ? 'text-teal-700 font-bold'
                              : isCompleted
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

              {/* Description & Photo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Citizen Problem Statement
                    </h3>
                    <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                      {complaint.description}
                    </p>
                  </div>

                  {complaint.resolutionRemarks && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Resolution Remarks & Field Notes
                      </div>
                      <p className="text-sm text-emerald-900">
                        {complaint.resolutionRemarks}
                      </p>
                      {complaint.resolvedAt && (
                        <div className="text-[11px] text-emerald-700 mt-2 font-medium">
                          Resolved on {new Date(complaint.resolvedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Citizen Info & Metadata */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Complainant:</span>
                      <span className="font-semibold text-slate-800">
                        {complaint.citizen.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Contact Verification:</span>
                      <span className="font-mono text-slate-700">
                        {complaint.citizen.phoneMasked}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Assigned Department:</span>
                      <span className="font-semibold text-slate-800">
                        {complaint.department || 'Pending Department Routing'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Assigned Officer:</span>
                      <span className="font-semibold text-slate-800">
                        {complaint.assignedOfficer?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Photo Evidence */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Visual Evidence / Photo
                  </h3>
                  {complaint.imageUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 group relative">
                      <img
                        src={complaint.imageUrl}
                        alt="Civic Complaint Evidence"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-2 bg-white text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-between">
                        <span>Geotagged Photo</span>
                        <span className="text-emerald-600 font-medium">EXIF Verified</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <AlertCircle className="w-6 h-6 mb-1 text-slate-300" />
                      <span className="text-xs">No image attachment uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <AIAnalysisCard
              analysis={complaint.aiAnalysis}
              complaintId={complaint.id}
              onSelectRelatedId={onSelectRelatedId}
            />
          )}

          {activeTab === 'action' && (
            <div className="space-y-6">
              {/* Status Update Card */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Update Complaint Status
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Advance the complaint through standard municipal workflow stages.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                  {statusProgression.map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                        selectedStatus === st
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {selectedStatus === 'Resolved' && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Official Resolution Remarks (Visible to Citizen)
                    </label>
                    <textarea
                      value={resolutionRemarks}
                      onChange={(e) => setResolutionRemarks(e.target.value)}
                      placeholder="Describe the action completed, materials replaced, or field inspection outcome..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    />
                  </div>
                )}

                <button
                  onClick={handleSaveStatus}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save Status Change ({selectedStatus})
                </button>
              </div>

              {/* Department & Officer Assignment */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Assign Department & Responsible Officer
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Allocate municipal resources and designate lead engineer accountable for SLA.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={selectedDept}
                      onChange={(e) => handleDeptChange(e.target.value as Department)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Responsible Officer / Lead Engineer
                    </label>
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal-600" />
                    <div>
                      <span className="font-semibold text-slate-800">
                        {DEFAULT_OFFICERS[selectedDept]?.designation || 'Municipal Engineer'}
                      </span>
                      <span className="text-slate-500 text-[11px] block">
                        Hotline: {DEFAULT_OFFICERS[selectedDept]?.phone || '+91 94480-00000'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    SLA Active: {complaint.aiAnalysis.slaHours} Hours
                  </span>
                </div>

                <button
                  onClick={handleSaveAssignment}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Confirm & Dispatch Work Order
                </button>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Official Incident Log & Timestamp Trail
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {complaint.timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-white ring-2 ring-slate-100" />
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          {event.title}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(event.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{event.actor}</span>
                        <span className="text-slate-300">·</span>
                        <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-700">
                          {event.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>CivicAI Issue Tracking Protocol · Bengaluru Municipal Admin System</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
