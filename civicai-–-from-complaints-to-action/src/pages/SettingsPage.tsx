import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  RotateCcw,
  Download,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Bell,
  Cpu,
} from 'lucide-react';
import { StorageService } from '../services/storageService';

interface SettingsPageProps {
  onResetData: () => void;
  complaintCount: number;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onResetData,
  complaintCount,
}) => {
  const [selectedCity, setSelectedCity] = useState('Bengaluru (BBMP)');
  const [geofenceRadius, setGeofenceRadius] = useState(800);
  const [confidenceThreshold, setConfidenceThreshold] = useState(90);
  const [useSimulatedAI, setUseSimulatedAI] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all demo complaints and hotspot clusters back to default?')) {
      StorageService.resetToDefault();
      onResetData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleExportBackup = () => {
    const complaints = StorageService.getComplaints();
    const clusters = StorageService.getHotspots();
    const payload = {
      exportedAt: new Date().toISOString(),
      system: 'CivicAI GovTech 2.5',
      complaints,
      clusters,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `CivicAI_System_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Platform Settings & AI Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure municipal jurisdiction rules, AI model triage parameters, and demo state
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Demo complaints successfully reset to original 35+ default records.</span>
        </div>
      )}

      {/* AI Triage Engine Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                CivicAI Diagnostic Engine Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Control NLP keyword matching, confidence gates, and spatial duplicate clustering
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-700">
            Engine v2.4
          </span>
        </div>

        <div className="space-y-4 text-xs">
          {/* Engine Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">
                AI Inference Mode
              </span>
              <span className="text-slate-500">
                {useSimulatedAI
                  ? 'Simulated AI Demo Engine (Deterministic Municipal Triage Logic)'
                  : 'Live Gemini API Integration (Requires GEMINI_API_KEY environment secret)'}
              </span>
            </div>
            <button
              onClick={() => setUseSimulatedAI(!useSimulatedAI)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                useSimulatedAI
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-teal-600 text-white border-teal-600'
              }`}
            >
              {useSimulatedAI ? 'Simulated AI (Active)' : 'Gemini 2.5 Live'}
            </button>
          </div>

          {/* Spatial Deduplication Radius Slider */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900">
                Spatial Cluster Geofence Radius
              </span>
              <span className="font-mono font-bold text-teal-700">
                {geofenceRadius} meters
              </span>
            </div>
            <p className="text-slate-500 mb-3">
              Radius within which adjacent citizen reports in the same category are grouped into an infrastructure cluster.
            </p>
            <input
              type="range"
              min="200"
              max="2000"
              step="50"
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Minimum AI Confidence Threshold */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900">
                Confidence Threshold for Auto-Routing
              </span>
              <span className="font-mono font-bold text-teal-700">
                {confidenceThreshold}%
              </span>
            </div>
            <p className="text-slate-500 mb-3">
              Complaints classified above this confidence are directly assigned to the department queue without human pre-screening.
            </p>
            <input
              type="range"
              min="70"
              max="98"
              step="1"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Municipal Authority Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Municipal Jurisdiction Setup
            </h2>
            <p className="text-xs text-slate-500">
              Local municipal corporation entity and ward boundaries
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Active Municipal Entity
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="Bengaluru (BBMP)">Bengaluru – BBMP (198 Wards)</option>
              <option value="Mumbai (MCGM)">Mumbai – BMC / MCGM (227 Wards)</option>
              <option value="Delhi (MCD)">Delhi – Municipal Corporation of Delhi (250 Wards)</option>
              <option value="Hyderabad (GHMC)">Hyderabad – GHMC (150 Wards)</option>
              <option value="Pune (PMC)">Pune – PMC (164 Wards)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Command Center Timezone
            </label>
            <input
              type="text"
              readOnly
              value="Asia/Kolkata (IST +05:30)"
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Data Persistence & Prototype Reset
            </h2>
            <p className="text-xs text-slate-500">
              Current local storage cache has {complaintCount} complaint records
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The prototype maintains all newly submitted complaints, status shifts, and department assignments in browser localStorage. You can export a snapshot backup or restore the original seed data anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Default Seed</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Registry Backup (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
