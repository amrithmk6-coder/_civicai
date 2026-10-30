import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint, HotspotCluster, PriorityLevel } from '../../types';

interface CivicMapProps {
  complaints?: Complaint[];
  clusters?: HotspotCluster[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: Complaint) => void;
  onSelectCluster?: (cluster: HotspotCluster) => void;
  center?: [number, number];
  zoom?: number;
  isLocationPicker?: boolean;
  pickerCoords?: { lat: number; lng: number } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
  heightClass?: string;
  showClusterPolygons?: boolean;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  complaints = [],
  clusters = [],
  selectedComplaintId = null,
  onSelectComplaint,
  onSelectCluster,
  center = [12.9716, 77.5946],
  zoom = 12,
  isLocationPicker = false,
  pickerCoords = null,
  onPickLocation,
  heightClass = 'h-[500px]',
  showClusterPolygons = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Handle map resize on container layout change
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle location picker click listener
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isLocationPicker) {
      const clickHandler = (e: L.LeafletMouseEvent) => {
        if (onPickLocation) {
          onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      };

      map.on('click', clickHandler);
      return () => {
        map.off('click', clickHandler);
      };
    }
  }, [isLocationPicker, onPickLocation]);

  // Update Location Picker marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLocationPicker) return;

    if (pickerMarkerRef.current) {
      map.removeLayer(pickerMarkerRef.current);
      pickerMarkerRef.current = null;
    }

    if (pickerCoords) {
      const pickerIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg ring-4 ring-white animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="absolute -bottom-1 w-3 h-1 bg-black/40 rounded-full blur-[1px]"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([pickerCoords.lat, pickerCoords.lng], {
        icon: pickerIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        if (onPickLocation) {
          onPickLocation({ lat: pos.lat, lng: pos.lng });
        }
      });

      pickerMarkerRef.current = marker;
      map.setView([pickerCoords.lat, pickerCoords.lng], 14, { animate: true });
    }
  }, [pickerCoords, isLocationPicker, onPickLocation]);

  // Render markers and cluster overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup || isLocationPicker) return;

    markersGroup.clearLayers();

    // 1. Render Cluster Circles if enabled
    if (showClusterPolygons && clusters.length > 0) {
      clusters.forEach((cluster) => {
        const clusterColor =
          cluster.severity === 'Critical'
            ? '#ef4444'
            : cluster.severity === 'High'
            ? '#f97316'
            : '#eab308';

        const circle = L.circle([cluster.centerCoords.lat, cluster.centerCoords.lng], {
          color: clusterColor,
          fillColor: clusterColor,
          fillOpacity: 0.15,
          weight: 2,
          radius: 480, // ~480m radius hotspot
        }).addTo(markersGroup);

        circle.bindTooltip(
          `<div class="p-1 font-sans">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hotspot Alert</div>
            <div class="text-xs font-bold text-slate-900">${cluster.name}</div>
            <div class="text-[11px] text-slate-600">${cluster.complaintCount} linked reports (${cluster.severity})</div>
          </div>`,
          { permanent: false, direction: 'top' }
        );

        circle.on('click', () => {
          if (onSelectCluster) onSelectCluster(cluster);
        });
      });
    }

    // 2. Render Complaint Markers
    complaints.forEach((complaint) => {
      const isSelected = complaint.id === selectedComplaintId;

      // Color coding rule from prompt:
      // Red: Critical
      // Orange: High priority
      // Yellow: Medium priority
      // Green: Low priority
      const priorityColors: Record<
        PriorityLevel,
        { bg: string; ring: string; border: string; glow: string }
      > = {
        Critical: {
          bg: '#ef4444',
          ring: 'rgba(239, 68, 68, 0.4)',
          border: '#b91c1c',
          glow: 'shadow-rose-500/50',
        },
        High: {
          bg: '#f97316',
          ring: 'rgba(249, 115, 22, 0.35)',
          border: '#c2410c',
          glow: 'shadow-orange-500/50',
        },
        Medium: {
          bg: '#eab308',
          ring: 'rgba(234, 179, 8, 0.35)',
          border: '#a16207',
          glow: 'shadow-yellow-500/50',
        },
        Low: {
          bg: '#10b981',
          ring: 'rgba(16, 185, 129, 0.35)',
          border: '#047857',
          glow: 'shadow-emerald-500/50',
        },
      };

      const color = priorityColors[complaint.priority] || priorityColors.Medium;
      const markerSize = isSelected ? 38 : 28;

      const markerHtml = `
        <div class="relative group cursor-pointer flex items-center justify-center">
          ${
            complaint.priority === 'Critical'
              ? `<div class="absolute -inset-1 rounded-full animate-ping opacity-75" style="background-color: ${color.bg}"></div>`
              : ''
          }
          <div 
            style="background-color: ${color.bg}; border-color: ${
        isSelected ? '#0f172a' : '#ffffff'
      }; width: ${markerSize}px; height: ${markerSize}px;"
            class="rounded-full shadow-md border-2 flex items-center justify-center text-white font-bold transition-transform transform hover:scale-125"
          >
            <span style="font-size: ${isSelected ? '12px' : '10px'}">
              ${complaint.priority === 'Critical' ? '!' : complaint.priority.charAt(0)}
            </span>
          </div>
          <div class="absolute -bottom-1 w-2 h-1 bg-black/30 rounded-full blur-[1px]"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'civic-marker-div',
        html: markerHtml,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
        popupAnchor: [0, -markerSize / 2],
      });

      const marker = L.marker([complaint.location.coords.lat, complaint.location.coords.lng], {
        icon: customIcon,
      }).addTo(markersGroup);

      // Interactive Popup
      const popupContent = document.createElement('div');
      popupContent.className = 'civic-popup-card font-sans p-2 min-w-[220px] max-w-[280px]';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-1 mb-1 border-b border-slate-100 pb-1.5">
          <span class="text-[10px] font-mono font-bold text-slate-500">${complaint.id}</span>
          <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white" style="background-color: ${color.bg}">
            ${complaint.priority}
          </span>
        </div>
        <div class="text-xs font-bold text-slate-900 leading-tight mb-1">
          ${complaint.title}
        </div>
        <div class="text-[11px] text-slate-500 mb-2">
          📍 ${complaint.location.locality} · ${complaint.category}
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-600">
          <span>Status: <strong>${complaint.status}</strong></span>
          <button id="view-btn-${complaint.id}" class="text-teal-700 hover:text-teal-900 font-bold hover:underline">
            Inspect Action →
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-btn-${complaint.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectComplaint) onSelectComplaint(complaint);
          };
        }
      });

      marker.on('click', () => {
        if (onSelectComplaint) onSelectComplaint(complaint);
      });
    });

    // If an item is selected, center map on it
    if (selectedComplaintId) {
      const selected = complaints.find((c) => c.id === selectedComplaintId);
      if (selected) {
        map.setView([selected.location.coords.lat, selected.location.coords.lng], 15, {
          animate: true,
        });
      }
    }
  }, [complaints, clusters, selectedComplaintId, isLocationPicker, showClusterPolygons, onSelectComplaint, onSelectCluster]);

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend & HUD Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-lg p-2.5 shadow-md text-xs">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Priority Map Pins
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse" />
            <span className="text-slate-700 font-medium">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            <span className="text-slate-700 font-medium">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-slate-700 font-medium">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-700 font-medium">Low</span>
          </div>
        </div>
      </div>

      {isLocationPicker && (
        <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 text-white backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-1.5 shadow-md text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span>Click anywhere on the map to pin incident location</span>
        </div>
      )}
    </div>
  );
};
