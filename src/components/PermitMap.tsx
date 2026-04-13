'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';

interface MapPermit {
  id: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  permitNumber: string;
  leadScore: number;
  urgency: string;
  ownerName?: string | null;
  contractorName?: string | null;
  estimatedValue?: number | null;
  status: string;
}

interface PermitMapProps {
  permits: MapPermit[];
  className?: string;
}

const URGENCY_COLORS: Record<string, string> = {
  hot: '#ef4444',
  warm: '#f97316',
  normal: '#3b82f6',
  cold: '#9ca3af',
};

// Springfield MO center
const DEFAULT_CENTER: [number, number] = [37.2090, -93.2923];
const DEFAULT_ZOOM = 11;

export default function PermitMap({ permits, className }: PermitMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = activeFilter ? permits.filter(p => p.urgency === activeFilter) : permits;

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.CircleMarker) map.removeLayer(layer);
    });

    // Add markers for filtered permits
    for (const p of filtered) {
      const color = URGENCY_COLORS[p.urgency] || URGENCY_COLORS.normal;
      const radius = p.leadScore >= 70 ? 10 : p.leadScore >= 50 ? 8 : 6;

      const marker = L.circleMarker([p.lat, p.lng], {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.85,
      }).addTo(map);

      const value = p.estimatedValue ? `$${Math.round(p.estimatedValue / 1000)}K` : '—';
      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 200px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">${p.address}</div>
          <div style="font-size: 11px; color: #666; margin-bottom: 8px;">${p.city} &middot; ${p.permitNumber}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
            <div><span style="color: #999;">Score:</span> <strong style="color: ${color};">${p.leadScore}</strong></div>
            <div><span style="color: #999;">Value:</span> <strong>${value}</strong></div>
            <div><span style="color: #999;">Status:</span> ${p.status.replace('_', ' ')}</div>
            <div><span style="color: #999;">Urgency:</span> <span style="color: ${color}; font-weight: 600;">${p.urgency.toUpperCase()}</span></div>
          </div>
          ${p.ownerName ? `<div style="font-size: 11px; margin-top: 6px; color: #666;">Owner: ${p.ownerName}</div>` : ''}
          ${p.contractorName ? `<div style="font-size: 11px; color: #666;">Builder: ${p.contractorName}</div>` : ''}
        </div>
      `);
    }

    // Fit bounds if we have permits
    if (filtered.length > 0) {
      const bounds = L.latLngBounds(filtered.map(p => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [filtered]);

  const urgencyCounts = {
    hot: permits.filter(p => p.urgency === 'hot').length,
    warm: permits.filter(p => p.urgency === 'warm').length,
    normal: permits.filter(p => p.urgency === 'normal').length,
    cold: permits.filter(p => p.urgency === 'cold').length,
  };

  return (
    <div className={cn('card overflow-hidden', className)}>
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <span className="text-xs font-medium text-gray-500">Filter:</span>
        <button
          onClick={() => setActiveFilter(null)}
          className={cn('btn-xs rounded-full', !activeFilter ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
        >
          All ({permits.length})
        </button>
        {(['hot', 'warm', 'normal', 'cold'] as const).map(u => (
          <button
            key={u}
            onClick={() => setActiveFilter(activeFilter === u ? null : u)}
            className={cn('btn-xs rounded-full', activeFilter === u ? 'text-white' : 'text-gray-600 hover:opacity-80')}
            style={{
              backgroundColor: activeFilter === u ? URGENCY_COLORS[u] : undefined,
              borderColor: URGENCY_COLORS[u],
              border: activeFilter !== u ? `1px solid ${URGENCY_COLORS[u]}40` : undefined,
            }}
          >
            {u} ({urgencyCounts[u]})
          </button>
        ))}
      </div>

      {/* Map */}
      <div ref={mapRef} className="h-[500px] w-full" />

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-2 border-t border-gray-100 text-[10px] text-gray-500">
        {Object.entries(URGENCY_COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="capitalize">{label}</span>
          </div>
        ))}
        <span className="text-gray-300">|</span>
        <span>Larger dot = higher score</span>
      </div>
    </div>
  );
}
