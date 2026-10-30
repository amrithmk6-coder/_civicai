export type ComplaintCategory =
  | 'Road Damage'
  | 'Waterlogging'
  | 'Waste Management'
  | 'Streetlight Issues'
  | 'Water Supply'
  | 'Drainage Problems'
  | 'Public Safety'
  | 'Other';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved';

export type Department =
  | 'Roads & Infrastructure'
  | 'Drainage & Stormwater'
  | 'Sanitation & Solid Waste'
  | 'Electrical & Street Lighting'
  | 'Water Supply & Sewerage'
  | 'Public Safety & Vigilance'
  | 'Urban Forestry & Parks'
  | 'General Administration';

export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface ComplaintLocation {
  address: string;
  locality: string;
  wardNumber: string;
  city: string;
  coords: LocationCoords;
}

export interface CitizenInfo {
  name: string;
  phoneMasked: string;
  emailMasked: string;
}

export interface OfficerAssignment {
  name: string;
  designation: string;
  department: Department;
  phone: string;
  email: string;
  assignedAt: string;
}

export interface AIAnalysis {
  identifiedCategory: ComplaintCategory;
  confidence: number; // e.g. 96
  summary: string;
  priority: PriorityLevel;
  duplicateDetection: {
    isDuplicateOrCluster: boolean;
    duplicateCount: number;
    relatedComplaintIds: string[];
    clusterName?: string;
    similarityScore: number;
  };
  estimatedImpact: string;
  reason: string;
  recommendedAction: string;
  suggestedDepartment: Department;
  slaHours: number;
  riskFactors: string[];
  keywordsDetected: string[];
  sentimentScore: 'Urgent/Alarming' | 'High Frustration' | 'Moderate Concern' | 'Standard Inquiry';
  infrastructureVulnerability: 'Critical' | 'Elevated' | 'Standard' | 'Low';
  isSimulated: boolean;
}

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  role: 'Citizen' | 'AI Dispatcher' | 'Ward Officer' | 'Department Head' | 'Field Engineer' | 'System';
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: PriorityLevel;
  status: ComplaintStatus;
  submittedAt: string;
  updatedAt: string;
  location: ComplaintLocation;
  citizen: CitizenInfo;
  imageUrl?: string;
  department?: Department;
  assignedOfficer?: OfficerAssignment;
  aiAnalysis: AIAnalysis;
  timeline: TimelineEvent[];
  resolutionRemarks?: string;
  resolvedAt?: string;
}

export interface HotspotCluster {
  id: string;
  name: string;
  locality: string;
  primaryCategory: ComplaintCategory;
  severity: PriorityLevel;
  complaintCount: number;
  complaintIds: string[];
  centerCoords: LocationCoords;
  aiRecommendation: string;
  rootCauseHypothesis: string;
  estimatedAffectedCitizens: number;
}
