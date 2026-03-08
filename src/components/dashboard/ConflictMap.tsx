import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ConflictEvent, EVENT_TYPE_CONFIG, CREDIBILITY_CONFIG } from '@/data/mockData';

const eventColorMap: Record<string, string> = {
  'ops-red': '#e04040',
  'ops-amber': '#d4952a',
  'ops-blue': '#4a8fd4',
  'ops-green': '#3ab54a',
  'ops-cyan': '#1ac8db',
};

interface ConflictMapProps {
  events: ConflictEvent[];
  onEventSelect?: (event: ConflictEvent) => void;
}

export default function ConflictMap({ events, onEventSelect }: ConflictMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [31.5, 35.5],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapInstance.current = map;

    // Force Leaflet to recalculate container size after render
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Fit bounds
    if (events.length > 0) {
      const bounds = L.latLngBounds(events.map(e => [e.location.lat, e.location.lng] as L.LatLngTuple));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    }

    // Add markers
    events.forEach((event) => {
      const config = EVENT_TYPE_CONFIG[event.type];
      const color = eventColorMap[config?.color || 'ops-cyan'] || '#1ac8db';
      const credConfig = CREDIBILITY_CONFIG[event.credibility];

      const icon = L.divIcon({
        className: 'custom-event-marker',
        html: `<div style="
          width: 12px; height: 12px;
          background: ${color};
          border: 2px solid ${color}88;
          border-radius: 50%;
          box-shadow: 0 0 12px ${color}66, 0 0 24px ${color}33;
          animation: pulse-dot 2s ease-in-out infinite;
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([event.location.lat, event.location.lng], { icon }).addTo(map);

      const formatTime = (ts: string) => {
        const d = new Date(ts);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      };

      marker.bindPopup(`
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="color: ${color}; font-size: 9px; font-weight: bold; letter-spacing: 0.1em;">${config.label}</span>
            <span style="color: #666; font-size: 9px;">${formatTime(event.timestamp)}</span>
          </div>
          <p style="font-weight: 600; margin: 4px 0; color: #d4d4d4; font-size: 11px; line-height: 1.3;">${event.title}</p>
          <p style="color: #888; font-size: 9px;">${event.location.name}</p>
          <div style="display: flex; align-items: center; gap: 4px; margin-top: 6px;">
            <span style="color: ${eventColorMap[credConfig.color]}; font-size: 8px; letter-spacing: 0.1em;">${credConfig.label}</span>
            <span style="color: #666; font-size: 8px;">— ${event.source}</span>
          </div>
        </div>
      `);

      marker.on('click', () => onEventSelect?.(event));

      // Add zone circle for strikes/ground ops
      if (event.type === 'airstrike' || event.type === 'ground_operation') {
        L.circle([event.location.lat, event.location.lng], {
          radius: 15000,
          color: color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 1,
          opacity: 0.3,
        }).addTo(map);
      }
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [events, onEventSelect]);

  return (
    <div className="relative h-full w-full rounded border border-border overflow-hidden">
      {/* HUD corners */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary z-[1000] pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary z-[1000] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary z-[1000] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary z-[1000] pointer-events-none" />

      {/* Status bar */}
      <div className="absolute top-2 left-8 z-[1000] pointer-events-none">
        <div className="flex items-center gap-2 text-[10px] text-primary font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-primary pulse-dot" />
          <span className="glow-text-cyan">LIVE FEED</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">{events.length} EVENTS TRACKED</span>
        </div>
      </div>

      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
