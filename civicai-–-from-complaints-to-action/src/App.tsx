import React, { useState, useEffect, useCallback } from 'react';
import { Complaint, ComplaintStatus, Department, HotspotCluster } from './types';
import { StorageService } from './services/storageService';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DemoTourBanner } from './components/layout/DemoTourBanner';
import { ComplaintModal } from './components/common/ComplaintModal';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { ReportComplaintPage } from './pages/ReportComplaintPage';
import { AllComplaintsPage } from './pages/AllComplaintsPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { HotspotMapPage } from './pages/HotspotMapPage';
import { ManageActionsPage } from './pages/ManageActionsPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [clusters, setClusters] = useState<HotspotCluster[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [trackingTargetId, setTrackingTargetId] = useState<string | null>(null);

  // Guided demo scenario step tracker (1 to 8)
  const [demoStep, setDemoStep] = useState<number>(1);
  const [demoComplaintId, setDemoComplaintId] = useState<string>('CIV-2026-1015');

  // Load complaints and clusters from storage
  const loadData = useCallback(() => {
    const data = StorageService.getComplaints();
    const hotspotData = StorageService.getHotspots();
    setComplaints(data);
    setClusters(hotspotData);
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = StorageService.subscribe(loadData);
    return () => unsubscribe();
  }, [loadData]);

  // Modal inspection triggers
  const handleOpenComplaintModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const handleCloseComplaintModal = () => {
    setIsModalOpen(false);
  };

  // Status and Department updates
  const handleUpdateStatus = (id: string, newStatus: ComplaintStatus, remarks?: string) => {
    const updated = StorageService.updateStatus(id, newStatus, remarks);
    if (updated) {
      setSelectedComplaint(updated);
      loadData();
    }
  };

  const handleAssignDepartment = (
    id: string,
    department: Department,
    officerName: string,
    officerDesignation: string,
    officerPhone: string
  ) => {
    const updated = StorageService.assignDepartmentAndOfficer(
      id,
      department,
      officerName,
      officerDesignation,
      officerPhone
    );
    if (updated) {
      setSelectedComplaint(updated);
      loadData();
    }
  };

  // When citizen submits a new complaint
  const handleComplaintSubmitted = (newComplaint: Complaint) => {
    loadData();
    setDemoComplaintId(newComplaint.id);
    setDemoStep(2); // Automatically advance demo tour to step 2!
  };

  // Direct ID search from navbar or tracking
  const handleSelectById = (id: string) => {
    const found = complaints.find((c) => c.id.toUpperCase() === id.toUpperCase());
    if (found) {
      setSelectedComplaint(found);
      setIsModalOpen(true);
    }
  };

  const handleNavigateToTracking = (id: string) => {
    setTrackingTargetId(id);
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Guided 8-Step Scenario Banner */}
      <DemoTourBanner
        currentStep={demoStep}
        onStepChange={(st) => setDemoStep(st)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onSelectComplaintById={handleSelectById}
        demoComplaintId={demoComplaintId}
      />

      <div className="flex-1 flex flex-row relative">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          complaints={complaints}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navbar */}
          <Navbar
            complaints={complaints}
            onSelectComplaint={handleOpenComplaintModal}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />

          {/* Dynamic Page Views */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'overview' && (
              <OverviewPage
                complaints={complaints}
                onSelectComplaint={handleOpenComplaintModal}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'report' && (
              <ReportComplaintPage
                existingComplaints={complaints}
                onComplaintSubmitted={handleComplaintSubmitted}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onSelectComplaint={handleOpenComplaintModal}
              />
            )}

            {activeTab === 'complaints' && (
              <AllComplaintsPage
                complaints={complaints}
                onSelectComplaint={handleOpenComplaintModal}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'ai-insights' && (
              <AIInsightsPage
                complaints={complaints}
                clusters={clusters}
                selectedComplaint={selectedComplaint}
                onSelectComplaint={handleOpenComplaintModal}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'hotspots' && (
              <HotspotMapPage
                complaints={complaints}
                clusters={clusters}
                onSelectComplaint={handleOpenComplaintModal}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'actions' && (
              <ManageActionsPage
                complaints={complaints}
                onSelectComplaint={handleOpenComplaintModal}
                onUpdateStatus={handleUpdateStatus}
                onAssignDepartment={handleAssignDepartment}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'tracking' && (
              <TrackComplaintPage
                complaints={complaints}
                selectedComplaintId={trackingTargetId || selectedComplaint?.id}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPage
                onResetData={loadData}
                complaintCount={complaints.length}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">CivicAI</span>
              <span>· From Complaints to Action · Municipal Operations Platform</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>SLA Target: 99.4%</span>
              <span>·</span>
              <span>Explainable AI Engine v2.4</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Administrative Detail & Triage Modal */}
      <ComplaintModal
        complaint={selectedComplaint}
        isOpen={isModalOpen}
        onClose={handleCloseComplaintModal}
        onUpdateStatus={handleUpdateStatus}
        onAssignDepartment={handleAssignDepartment}
        onNavigateToTracking={handleNavigateToTracking}
        onSelectRelatedId={handleSelectById}
      />
    </div>
  );
}
