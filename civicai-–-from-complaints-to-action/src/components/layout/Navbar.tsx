import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  User,
  Calendar,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Menu,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Complaint } from '../../types';

interface NavbarProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onOpenMobileSidebar: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  complaints,
  onSelectComplaint,
  onOpenMobileSidebar,
  onNavigateToTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  // Format Current Date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter search results
  const searchResults = searchQuery.trim()
    ? complaints
        .filter(
          (c) =>
            c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.location.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  // Critical alerts for notification drawer
  const criticalComplaints = complaints.filter(
    (c) => c.priority === 'Critical' && c.status !== 'Resolved'
  );

  // Click outside listener for search & notif
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 gap-4">
        {/* Left: Mobile Toggle & Brand (Visible on mobile if sidebar hidden) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigateToTab('overview')}>
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
              C
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold tracking-tight text-base text-white">
                  CivicAI
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700/50">
                  GovTech 2.5
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                From Complaints to Action
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Universal Search Bar */}
        <div ref={searchContainerRef} className="flex-1 max-w-lg relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search by Complaint ID (e.g. CIV-2026-1042), locality, or issue..."
              className="w-full text-xs pl-9 pr-8 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-950/40 flex justify-between">
                <span>Matching Complaints ({searchResults.length})</span>
                <span>Press Esc to close</span>
              </div>
              <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectComplaint(item);
                      setIsSearchFocused(false);
                      setSearchQuery('');
                    }}
                    className="p-3 hover:bg-slate-800 cursor-pointer transition-colors flex items-center justify-between gap-3 text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-semibold text-teal-400">
                          {item.id}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          · {item.location.locality}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            item.priority === 'Critical'
                              ? 'bg-rose-950 text-rose-300'
                              : item.priority === 'High'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-blue-950 text-blue-300'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <div className="text-xs text-slate-200 truncate font-medium">
                        {item.title}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Date, Notifications & Admin Profile */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Current Date */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>{currentDateTime}</span>
          </div>

          {/* Notifications Button & Dropdown */}
          <div ref={notifContainerRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {criticalComplaints.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 text-left">
                <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Critical Incident Alerts
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                    {criticalComplaints.length} Urgent
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                  {criticalComplaints.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                      All critical incidents are currently resolved.
                    </div>
                  ) : (
                    criticalComplaints.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectComplaint(item);
                          setShowNotifications(false);
                        }}
                        className="p-3 hover:bg-slate-800/80 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-rose-400">
                            {item.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            SLA: {item.aiAnalysis.slaHours}h
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 line-clamp-1 font-medium">
                          {item.title}
                        </p>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                          <span>📍 {item.location.locality}</span>
                          <span className="text-teal-400 font-semibold hover:underline">
                            Action →
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-800 bg-slate-950 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigateToTab('actions');
                    }}
                    className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                  >
                    View All Priority Actions →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-300 text-xs font-bold">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-white leading-tight">
                Dr. Sameer Joshi
              </div>
              <div className="text-[10px] text-slate-400">
                Superintending Engineer
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
