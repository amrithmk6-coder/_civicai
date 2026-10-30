import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  PlayCircle,
  RotateCcw,
} from 'lucide-react';
import { Complaint, ComplaintStatus, Department } from '../../types';

interface DemoTourBannerProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onNavigateToTab: (tab: string) => void;
  onSelectComplaintById: (id: string) => void;
  onPerformDemoAction?: (actionName: string) => void;
  demoComplaintId: string;
}

export const DemoTourBanner: React.FC<DemoTourBannerProps> = ({
  currentStep,
  onStepChange,
  onNavigateToTab,
  onSelectComplaintById,
  demoComplaintId,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const steps = [
    {
      step: 1,
      title: 'Citizen submits complaint',
      description: 'Go to "Report a Problem" and submit a damaged road complaint (or use 1-click preset).',
      tab: 'report',
      actionText: 'Go to Report Form',
    },
    {
      step: 2,
      title: 'Display submitted complaint',
      description: `View the generated complaint (${demoComplaintId}) in All Complaints table.`,
      tab: 'complaints',
      actionText: 'View in Table',
    },
    {
      step: 3,
      title: 'Inspect AI Diagnostic & Rationale',
      description: 'Open AI Analysis to view categorized road damage, priority reason & cluster match.',
      tab: 'ai-insights',
      actionText: 'View AI Diagnostics',
    },
    {
      step: 4,
      title: 'Identify related cluster & hotspots',
      description: 'Inspect the geographic cluster map highlighting related road damage reports on ORR.',
      tab: 'hotspots',
      actionText: 'Inspect Hotspot Map',
    },
    {
      step: 5,
      title: 'Assign to Roads Department',
      description: 'Dispatch the work order to Roads & Infrastructure with lead engineer.',
      tab: 'actions',
      actionText: 'Open Action Kanban',
    },
    {
      step: 6,
      title: 'Advance status to In Progress',
      description: 'Move complaint from Assigned to In Progress as field crew deploys on site.',
      tab: 'actions',
      actionText: 'View In Progress',
    },
    {
      step: 7,
      title: 'Mark as Resolved',
      description: 'Complete the road repair and log official asphalt restoration remarks.',
      tab: 'actions',
      actionText: 'Resolve Incident',
    },
    {
      step: 8,
      title: 'Citizen tracks updated status',
      description: `Citizen enters ${demoComplaintId} in Track My Complaint to verify real-time resolution.`,
      tab: 'tracking',
      actionText: 'Track Resolution',
    },
  ];

  const currentInfo = steps[currentStep - 1] || steps[0];

  const handleExecuteStep = (stepIdx: number) => {
    onStepChange(stepIdx);
    const target = steps[stepIdx - 1];
    if (target) {
      onNavigateToTab(target.tab);
      if (demoComplaintId && (stepIdx === 2 || stepIdx === 3 || stepIdx === 8)) {
        onSelectComplaintById(demoComplaintId);
      }
    }
  };

  return (
    <div className="bg-slate-900 border-b border-teal-500/30 text-white px-4 py-2.5 shadow-md relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Guided Demo Walkthrough
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                Step {currentStep} of 8
              </span>
            </div>
            {!isMinimized && (
              <p className="text-xs text-slate-300 mt-0.5">
                <strong className="text-white">{currentInfo.title}:</strong>{' '}
                {currentInfo.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Step controls & actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExecuteStep(currentStep)}
            className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>{currentInfo.actionText}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {currentStep < 8 ? (
            <button
              onClick={() => handleExecuteStep(currentStep + 1)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-700"
            >
              Next Step ({currentStep + 1}) →
            </button>
          ) : (
            <button
              onClick={() => handleExecuteStep(1)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restart Tour</span>
            </button>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded text-slate-400 hover:text-white"
            title={isMinimized ? 'Expand' : 'Collapse'}
          >
            {isMinimized ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Dismiss Demo Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
