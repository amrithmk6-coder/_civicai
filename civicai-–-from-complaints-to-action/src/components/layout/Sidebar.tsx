import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Sparkles,
  MapPin,
  Kanban,
  SearchCheck,
  Settings,
  X,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { Complaint } from '../../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  complaints: Complaint[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  complaints,
  isMobileOpen,
  onCloseMobile,
}) => {
  const pendingCount = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;

  const criticalCount = complaints.filter(
    (c) => c.priority === 'Critical' && c.status !== 'Resolved'
  ).length;

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'report',
      label: 'Report a Problem',
      icon: PlusCircle,
      badge: 'Citizen',
      badgeColor: 'bg-teal-900/60 text-teal-300 border border-teal-700/50',
    },
    {
      id: 'complaints',
      label: 'All Complaints',
      icon: FileText,
      badge: complaints.length.toString(),
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      icon: Sparkles,
      badge: 'Neural',
      badgeColor: 'bg-indigo-950 text-indigo-300 border border-indigo-800',
    },
    {
      id: 'hotspots',
      label: 'Hotspot Map',
      icon: MapPin,
      badge: criticalCount > 0 ? `${criticalCount} Alert` : null,
      badgeColor: 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse',
    },
    {
      id: 'actions',
      label: 'Manage Actions',
      icon: Kanban,
      badge: pendingCount > 0 ? `${pendingCount} Pending` : null,
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-800',
    },
    {
      id: 'tracking',
      label: 'Track My Complaint',
      icon: SearchCheck,
      badge: 'Public',
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleSelect = (id: string) => {
    onTabChange(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col z-40 border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
              C
            </div>
            <div>
              <div className="font-bold text-white text-base leading-none">
                CivicAI
              </div>
              <div className="text-[11px] text-teal-400 font-medium mt-1">
                From Complaints to Action
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Municipal Portal Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-teal-950/70 text-teal-300 border border-teal-700/60 font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      item.badgeColor || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* System Status / Quick Info Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs text-slate-300 mb-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Neural Dispatch: Online</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-snug">
            Connected to City Command Center · SLA Compliance at 94.8%
          </div>
        </div>
      </aside>
    </>
  );
};
