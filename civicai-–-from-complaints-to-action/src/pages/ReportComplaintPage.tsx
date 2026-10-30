import React, { useState } from 'react';
import {
  Upload,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Camera,
  Trash2,
  RefreshCw,
  Send,
  Navigation,
} from 'lucide-react';
import { Complaint, ComplaintCategory } from '../types';
import { CivicMap } from '../components/map/CivicMap';
import { AITriageService } from '../services/aiTriageService';
import { StorageService } from '../services/storageService';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';

interface ReportComplaintPageProps {
  existingComplaints: Complaint[];
  onComplaintSubmitted: (newComplaint: Complaint) => void;
  onNavigateToTab: (tab: string) => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

const CATEGORIES: ComplaintCategory[] = [
  'Road Damage',
  'Waterlogging',
  'Waste Management',
  'Streetlight Issues',
  'Water Supply',
  'Drainage Problems',
  'Public Safety',
  'Other',
];

const PRESET_SAMPLE_ISSUES = [
  {
    label: 'Road Pothole Hazard (Demo Preset)',
    title: 'Severe crater pothole causing vehicle skid on Outer Ring Road',
    category: 'Road Damage' as ComplaintCategory,
    description:
      'Deep pothole measuring 2 feet wide has formed in the middle lane near Bellandur flyover. Two-wheelers are swerving dangerously into bus lanes to avoid it.',
    locality: 'Bellandur / Outer Ring Road',
    address: 'Near Ecospace Tech Park, Outer Ring Road, Bellandur',
    wardNumber: 'Ward 150 - Bellandur',
    coords: { lat: 12.9298, lng: 77.6743 },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Blocked Stormwater Drain (Indiranagar Cluster)',
    title: 'Blocked drainage overflow flooding shops on 100 Feet Road',
    category: 'Drainage Problems' as ComplaintCategory,
    description:
      'Stormwater drain completely clogged with plastic waste and mud. Water overflowing onto 100 Feet Road outside stores making pedestrian crossing impossible.',
    locality: 'Indiranagar',
    address: 'Near 12th Main Junction, 100 Feet Road, Indiranagar',
    wardNumber: 'Ward 82 - HAL Airport Road',
    coords: { lat: 12.9756, lng: 77.6413 },
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f1563?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Live Electrical Wire (Critical Safety)',
    title: 'Exposed live electric wire dangling near bus shelter',
    category: 'Public Safety' as ComplaintCategory,
    description:
      'A storm damaged the junction pole. An exposed energized cable is dangling 4 feet above the sidewalk with active sparks.',
    locality: 'Koramangala',
    address: '80 Feet Road, near St. Anne school bus stop, Koramangala 4th Block',
    wardNumber: 'Ward 151 - Koramangala',
    coords: { lat: 12.9345, lng: 77.6254 },
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
  },
];

export const ReportComplaintPage: React.FC<ReportComplaintPageProps> = ({
  existingComplaints,
  onComplaintSubmitted,
  onNavigateToTab,
  onSelectComplaint,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Road Damage');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('100 Feet Road, Indiranagar');
  const [locality, setLocality] = useState('Indiranagar');
  const [wardNumber, setWardNumber] = useState('Ward 82 - HAL Airport Road');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9756,
    lng: 77.6413,
  });
  const [citizenName, setCitizenName] = useState('Rohan Deshmukh');
  const [citizenPhone, setCitizenPhone] = useState('+91 98451-23498');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Quick preset loader
  const handleApplyPreset = (preset: (typeof PRESET_SAMPLE_ISSUES)[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setDescription(preset.description);
    setLocality(preset.locality);
    setAddress(preset.address);
    setWardNumber(preset.wardNumber);
    setCoords(preset.coords);
    setImageUrl(preset.imageUrl);
    setImagePreview(preset.imageUrl);
  };

  // Handle Image File Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Map coordinate picker handler
  const handlePickLocation = (newCoords: { lat: number; lng: number }) => {
    setCoords(newCoords);
    setAddress(`Pinned Geo-Location (${newCoords.lat.toFixed(4)}, ${newCoords.lng.toFixed(4)})`);
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Generate Unique ID e.g. CIV-2026-4891
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newId = `CIV-2026-${randomSuffix}`;
      const now = new Date().toISOString();

      // Mask citizen contact info for privacy compliance
      const maskedPhone =
        citizenPhone.length > 5
          ? `${citizenPhone.slice(0, 7)}XXXX${citizenPhone.slice(-2)}`
          : '+91 98XXX-XXXX0';
      const maskedEmail = 'citizen.portal@civic-gov.in';

      // Run AI Triage Engine
      const aiAnalysis = AITriageService.analyzeComplaint(
        title,
        description,
        category,
        coords,
        existingComplaints
      );

      const newComplaint: Complaint = {
        id: newId,
        title: title.trim(),
        description: description.trim(),
        category,
        priority: aiAnalysis.priority,
        status: 'Submitted',
        submittedAt: now,
        updatedAt: now,
        location: {
          address,
          locality,
          wardNumber,
          city: 'Bengaluru',
          coords,
        },
        citizen: {
          name: citizenName || 'Anonymous Citizen',
          phoneMasked: maskedPhone,
          emailMasked: maskedEmail,
        },
        imageUrl: imageUrl || undefined,
        department: aiAnalysis.suggestedDepartment,
        aiAnalysis,
        timeline: [
          {
            id: `tl-${Date.now()}-1`,
            status: 'Submitted',
            title: 'Complaint Registered',
            description: `Citizen filed complaint with verified geotag in ${locality}.`,
            timestamp: now,
            actor: citizenName || 'Citizen',
            role: 'Citizen',
          },
          {
            id: `tl-${Date.now()}-2`,
            status: 'Under Review',
            title: 'AI Automated Triage & Deduplication Complete',
            description: `CivicAI classified incident as ${aiAnalysis.priority} priority with ${aiAnalysis.confidence}% confidence. Suggested routing: ${aiAnalysis.suggestedDepartment}.`,
            timestamp: now,
            actor: 'CivicAI Neural Engine v2.4',
            role: 'AI Dispatcher',
          },
        ],
      };

      // Persist to storage & update parent
      StorageService.addComplaint(newComplaint);
      onComplaintSubmitted(newComplaint);
      setSubmittedComplaint(newComplaint);
      setIsSubmitting(false);
    }, 600);
  };

  const handleCopyId = () => {
    if (!submittedComplaint) return;
    navigator.clipboard.writeText(submittedComplaint.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // If successfully submitted, render the comprehensive success receipt screen!
  if (submittedComplaint) {
    return (
      <div className="max-w-3xl mx-auto py-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8">
          {/* Header */}
          <div className="text-center pb-6 border-b border-slate-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Complaint Successfully Lodged & Triaged
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your report has been assigned a unique reference ID and processed by CivicAI.
            </p>

            {/* Generated Complaint ID Box */}
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">Complaint ID:</span>
              <span className="font-mono text-base font-extrabold text-slate-900">
                {submittedComplaint.id}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 text-slate-500 hover:text-slate-800 transition-colors"
                title="Copy ID"
              >
                {copiedId ? (
                  <span className="text-xs text-emerald-600 font-semibold">Copied!</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Details & AI Result Overview */}
          <div className="py-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Current Status</span>
                <div className="mt-1">
                  <StatusBadge status={submittedComplaint.status} size="sm" />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Assessed Priority</span>
                <div className="mt-1">
                  <PriorityBadge priority={submittedComplaint.priority} size="sm" />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Assigned Dept</span>
                <span className="text-xs font-semibold text-slate-800 truncate block mt-1">
                  {submittedComplaint.department}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">SLA Commitment</span>
                <span className="text-xs font-bold text-teal-700 block mt-1">
                  {submittedComplaint.aiAnalysis.slaHours} Hours
                </span>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                {submittedComplaint.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {submittedComplaint.description}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {submittedComplaint.location.address}, {submittedComplaint.location.locality}
                </span>
              </div>
            </div>

            {/* AI Diagnostics Snapshot */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>CivicAI Triage Synthesis</span>
                </div>
                <span className="text-[10px] font-mono bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-700/50">
                  {submittedComplaint.aiAnalysis.confidence}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {submittedComplaint.aiAnalysis.reason}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                setSubmittedComplaint(null);
                setTitle('');
                setDescription('');
                setImagePreview(null);
                setImageUrl('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              File Another Problem
            </button>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  onSelectComplaint(submittedComplaint);
                  onNavigateToTab('tracking');
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Track My Complaint</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  onSelectComplaint(submittedComplaint);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Open Full Details Modal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Citizen Portal – Report a Civic Problem
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit infrastructure grievances directly to municipal authorities. Complete in under 60 seconds.
        </p>
      </div>

      {/* 1-Click Demo Presets Bar */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-teal-900">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="font-semibold">Quick Test Presets:</span>
          <span className="text-teal-700 hidden sm:inline">Pre-fill realistic complaints in 1-click:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_SAMPLE_ISSUES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-900 text-xs font-medium rounded-lg border border-teal-300 transition-colors shadow-2xs"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
          {/* Complaint Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Complaint Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Deep pothole causing skids on Outer Ring Road"
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>

          {/* Category Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Locality / Ward Area
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g., Indiranagar / Ward 82"
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Detailed Problem Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Detailed Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, severity, hazards to pedestrians or traffic, duration, and landmarks..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white leading-relaxed"
            />
          </div>

          {/* Location Input & Address */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Street Address & Landmarks</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
              </span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Specific street address or nearby landmark"
                className="w-full text-xs pl-9 pr-3 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Citizen Details */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
              Citizen Complainant Contact
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Mobile Number (SMS Updates)</label>
                <input
                  type="text"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              * Required fields. All reports are verified by municipal field officers.
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                  <span>Processing AI Triage...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Image Upload & Interactive Location Map Selector */}
        <div className="space-y-6">
          {/* Image Upload Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Photo Evidence</span>
              <span className="text-[11px] text-teal-700 font-medium">Recommended</span>
            </label>

            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 group">
                <img
                  src={imagePreview}
                  alt="Evidence Preview"
                  className="w-full h-44 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageUrl('');
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  title="Remove Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="p-2 bg-slate-50 text-[11px] text-slate-500 border-t border-slate-200 flex items-center justify-between">
                  <span>Image attached</span>
                  <span className="text-emerald-600 font-medium">Ready</span>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-2">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  Upload or Take Photo
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Interactive Map Location Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Map Location Selector
              </label>
              <span className="text-[11px] text-teal-700 font-medium">
                Click map to pin
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Drop the pin precisely where the municipal issue is located.
            </p>

            <CivicMap
              center={[coords.lat, coords.lng]}
              zoom={13}
              isLocationPicker={true}
              pickerCoords={coords}
              onPickLocation={handlePickLocation}
              heightClass="h-56"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
