import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  Layers,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  ShieldAlert,
  Info,
  Maximize2,
} from 'lucide-react';
import { Complaint, HotspotCluster, PriorityLevel } from '../types';
import { CivicMap } from '../components/map/CivicMap';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';

interface HotspotMapPageProps {
  complaints: Complaint[];
  clusters: HotspotCluster[];
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigateToTab: (tab: string) => void;
}

export const HotspotMapPage: React.FC<HotspotMapPageProps> = ({
  complaints,
  clusters,
  onSelectComplaint,
  onNavigateToTab,
}) => {
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>('cluster-1');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [showClusterCircles, setShowClusterCircles] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(12);

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId) || clusters[0];

  // Filter complaints for map
  const mapComplaints = complaints.filter(
    (c) => priorityFilter === 'All' || c.priority === priorityFilter
  );

  const handleSelectCluster = (cluster: HotspotCluster) => {
    setSelectedClusterId(cluster.id);
    setMapCenter([cluster.centerCoords.lat, cluster.centerCoords.lng]);
    setMapZoom(14);
  };

  const clusterComplaints = complaints.filter((c) =>
    selectedCluster?.complaintIds.includes(c.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Hotspot Map & Geographic Density Intelligence
            </h1>
            <span className="text-[11px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
              Synthetic Geospatial Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Spatial clustering identifying repeating infrastructure vulnerabilities and systemic ward failures
          </p>
        </div>

        {/* Priority Filter Chips */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                priorityFilter === p
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Hotspots Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Map */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Geotagged Incident Map ({mapComplaints.length} active pins)</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={showClusterCircles}
                    onChange={(e) => setShowClusterCircles(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Show Hotspot Radii</span>
                </label>
              </div>
            </div>

            <CivicMap
              complaints={mapComplaints}
              clusters={clusters}
              center={mapCenter}
              zoom={mapZoom}
              showClusterPolygons={showClusterCircles}
              onSelectComplaint={onSelectComplaint}
              onSelectCluster={handleSelectCluster}
              heightClass="h-[480px]"
            />
          </div>

          {/* Example AI Hotspot Insight Banner (From Prompt Requirement) */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-950">
              <div className="font-bold text-teal-900 mb-0.5">
                AI Detected Infrastructure Hotspot: Indiranagar Ward 82
              </div>
              <p className="leading-relaxed">
                &quot;Multiple drainage and waterlogging complaints have been reported in the same area (Indiranagar 100ft road corridor). Immediate inspection and desilting is recommended before afternoon monsoon precipitation to prevent major commercial basement inundation.&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Detected Hotspot Clusters List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-700" />
                <span>Active Hotspot Clusters ({clusters.length})</span>
              </h3>
              <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                Critical Density
              </span>
            </div>

            <div className="space-y-3">
              {clusters.map((cluster) => {
                const isSelected = cluster.id === selectedCluster?.id;
                return (
                  <div
                    key={cluster.id}
                    onClick={() => handleSelectCluster(cluster)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-teal-500/50'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <PriorityBadge priority={cluster.severity} size="sm" />
                      <span
                        className={`text-[11px] font-mono font-semibold ${
                          isSelected ? 'text-teal-300' : 'text-slate-600'
                        }`}
                      >
                        {cluster.complaintCount} Reports Clustered
                      </span>
                    </div>

                    <h4
                      className={`text-xs font-bold leading-snug mb-1 ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {cluster.name}
                    </h4>

                    <div
                      className={`text-[11px] flex items-center gap-1 mb-2 ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-teal-400" />
                      <span>{cluster.locality}</span>
                    </div>

                    <div
                      className={`text-[11px] p-2 rounded-lg border leading-relaxed ${
                        isSelected
                          ? 'bg-slate-950/70 border-slate-800 text-slate-300'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {cluster.aiRecommendation}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className={`${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        ~{cluster.estimatedAffectedCitizens.toLocaleString()} Citizens Impacted
                      </span>
                      <span
                        className={`font-semibold ${
                          isSelected ? 'text-teal-300' : 'text-slate-700'
                        }`}
                      >
                        Focus On Map →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grouped Reports for Selected Cluster */}
          {selectedCluster && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Reports Inside &quot;{selectedCluster.name}&quot; ({clusterComplaints.length})
              </div>
              <div className="divide-y divide-slate-100">
                {clusterComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectComplaint(c)}
                    className="py-2.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-700">{c.id}</span>
                        <PriorityBadge priority={c.priority} size="sm" showDot={false} />
                      </div>
                      <div className="text-slate-800 font-medium truncate max-w-[200px] mt-0.5">
                        {c.title}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
