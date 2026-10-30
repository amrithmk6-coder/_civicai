import { Complaint, ComplaintCategory, ComplaintStatus, Department, HotspotCluster, PriorityLevel } from '../types';
import { HOTSPOT_CLUSTERS, INITIAL_COMPLAINTS } from '../data/mockData';

const STORAGE_KEY = 'civic_ai_complaints_v1';
const CLUSTERS_KEY = 'civic_ai_clusters_v1';
const EVENT_NAME = 'civic_ai_data_changed';

export class StorageService {
  private static notifyListeners() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    }
  }

  static getComplaints(): Complaint[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.saveComplaints(INITIAL_COMPLAINTS);
        return INITIAL_COMPLAINTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_COMPLAINTS;
    }
  }

  static saveComplaints(complaints: Complaint[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save complaints to localStorage', e);
    }
  }

  static getHotspots(): HotspotCluster[] {
    try {
      const data = localStorage.getItem(CLUSTERS_KEY);
      if (!data) {
        localStorage.setItem(CLUSTERS_KEY, JSON.stringify(HOTSPOT_CLUSTERS));
        return HOTSPOT_CLUSTERS;
      }
      return JSON.parse(data);
    } catch {
      return HOTSPOT_CLUSTERS;
    }
  }

  static getComplaintById(id: string): Complaint | undefined {
    const complaints = this.getComplaints();
    const cleanId = id.trim().toUpperCase();
    return complaints.find(
      (c) => c.id.toUpperCase() === cleanId || c.id.toUpperCase().endsWith(cleanId)
    );
  }

  static addComplaint(complaint: Complaint): Complaint {
    const list = this.getComplaints();
    const updated = [complaint, ...list];
    this.saveComplaints(updated);
    return complaint;
  }

  static updateComplaint(updated: Complaint): Complaint {
    const list = this.getComplaints();
    const index = list.findIndex((c) => c.id === updated.id);
    if (index !== -1) {
      list[index] = {
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      this.saveComplaints(list);
    }
    return updated;
  }

  static updateStatus(
    id: string,
    newStatus: ComplaintStatus,
    remarks?: string,
    actorName: string = 'Municipal Administrator'
  ): Complaint | null {
    const list = this.getComplaints();
    const target = list.find((c) => c.id === id);
    if (!target) return null;

    const now = new Date().toISOString();
    const newTimelineEvent = {
      id: `tl-${Date.now()}`,
      status: newStatus,
      title: `Status shifted to ${newStatus}`,
      description: remarks || `Administrative action updated state to ${newStatus}.`,
      timestamp: now,
      actor: actorName,
      role: 'Ward Officer' as const,
    };

    target.status = newStatus;
    target.updatedAt = now;
    target.timeline = [...target.timeline, newTimelineEvent];

    if (newStatus === 'Resolved') {
      target.resolvedAt = now;
      if (remarks) target.resolutionRemarks = remarks;
    }

    this.saveComplaints(list);
    return target;
  }

  static assignDepartmentAndOfficer(
    id: string,
    department: Department,
    officerName: string,
    officerDesignation: string = 'Designated Lead Engineer',
    officerPhone: string = '+91 94480-00000',
    actorName: string = 'Municipal Control Desk'
  ): Complaint | null {
    const list = this.getComplaints();
    const target = list.find((c) => c.id === id);
    if (!target) return null;

    const now = new Date().toISOString();
    target.department = department;
    target.assignedOfficer = {
      name: officerName,
      designation: officerDesignation,
      department,
      phone: officerPhone,
      email: `${officerName.toLowerCase().replace(/[^a-z]/g, '')}@civic-gov.in`,
      assignedAt: now,
    };

    if (target.status === 'Submitted' || target.status === 'Under Review') {
      target.status = 'Assigned';
    }

    target.timeline = [
      ...target.timeline,
      {
        id: `tl-${Date.now()}`,
        status: target.status,
        title: `Work Order Assigned: ${department}`,
        description: `Designated responsible officer: ${officerName} (${officerDesignation}) with SLA tracking active.`,
        timestamp: now,
        actor: actorName,
        role: 'Department Head',
      },
    ];

    target.updatedAt = now;
    this.saveComplaints(list);
    return target;
  }

  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CLUSTERS_KEY);
    this.saveComplaints(INITIAL_COMPLAINTS);
    localStorage.setItem(CLUSTERS_KEY, JSON.stringify(HOTSPOT_CLUSTERS));
    this.notifyListeners();
  }

  static subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(EVENT_NAME, callback);
    return () => window.removeEventListener(EVENT_NAME, callback);
  }
}
