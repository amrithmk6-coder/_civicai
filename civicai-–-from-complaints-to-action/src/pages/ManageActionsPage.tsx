import React, { useState } from 'react';
import {
  Kanban,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  AlertCircle,
  Filter,
  Search,
  User,
  MapPin,
  ArrowRight,
  Shield,
  Phone,
  Plus,
} from 'lucide-react';
import { Complaint, ComplaintStatus, Department, PriorityLevel } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';

interface ManageActionsPageProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus, remarks?: string) => void;
  onAssignDepartment: (
    id: string,
    department: Department,
    officerName: string,
    officerDesignation: string,
    officerPhone: string
  ) => void;
  onNavigateToTab: (tab: string) => void;
}

export const ManageActionsPage: React.FC<ManageActionsPageProps> = ({
  complaints,
  onSelectComplaint,
  onUpdateStatus,
  onAssignDepartment,
  onNavigateToTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const STAGES: ComplaintStatus[] = [
    'Submitted',
    'Under Review',
    'Assigned',
    'In Progress',
    'Resolved',
  ];

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

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.locality.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      departmentFilter === 'All' || c.department === departmentFilter;

    const matchesPri =
      priorityFilter === 'All' || c.priority === priorityFilter;

    return matchesSearch && matchesDept && matchesPri;
  });

  const getNextStatus = (current: ComplaintStatus): ComplaintStatus | null => {
    const idx = STAGES.indexOf(current);
    if (idx !== -1 && idx < STAGES.length - 1) {
      return STAGES[idx + 1];
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Complaint Action & Workflow Board
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department dispatching, officer accountability, and SLA progression pipeline
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('complaints')}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Registry Table View</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID or title..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Columns (5 Stages) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageComplaints = filteredComplaints.filter(
            (c) => c.status === stage
          );
          const nextStage = getNextStatus(stage);

          return (
            <div
              key={stage}
              className="bg-slate-100/70 rounded-xl border border-slate-200 p-3 flex flex-col min-w-[270px] max-h-[750px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-800">
                    {stage}
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-full text-slate-600 border border-slate-200 shadow-2xs">
                    {stageComplaints.length}
                  </span>
                </div>
              </div>

              {/* Cards List in Stage */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {stageComplaints.length === 0 ? (
                  <div className="h-28 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400 text-center p-2">
                    No complaints in {stage}
                  </div>
                ) : (
                  stageComplaints.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectComplaint(item)}
                      className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-mono text-[11px] font-bold text-slate-600">
                            {item.id}
                          </span>
                          <PriorityBadge priority={item.priority} size="sm" />
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-teal-700 transition-colors">
                          {item.title}
                        </h4>

                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.location.locality}</span>
                        </div>
                      </div>

                      {/* Department & Officer Footer */}
                      <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1.5">
                        <div className="text-slate-700 font-semibold truncate">
                          🏛️ {item.department || 'Unassigned'}
                        </div>

                        {item.assignedOfficer && (
                          <div className="text-slate-500 text-[10px] truncate flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{item.assignedOfficer.name}</span>
                          </div>
                        )}

                        {/* Quick 1-Click Status Advancement Button */}
                        {nextStage && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(
                                item.id,
                                nextStage,
                                `Advanced directly via Kanban board to ${nextStage}`
                              );
                            }}
                            className="w-full mt-2 py-1 px-2 bg-slate-900 hover:bg-teal-700 text-white rounded text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                          >
                            <span>Advance to {nextStage}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
