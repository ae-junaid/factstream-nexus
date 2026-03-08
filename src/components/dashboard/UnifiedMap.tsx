import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ConflictEvent, EVENT_TYPE_CONFIG, CREDIBILITY_CONFIG } from '@/data/mockData';
import { Plane, Anchor, Radio, Crosshair, Layers, AlertTriangle } from 'lucide-react';

// ── Flight mock data ──
interface FlightData {
  id: string;
  callsign: string;
  type: string;
  lat: number;
  lng: number;
  altitude: string;
  speed: string;
  heading: number;
  origin: string;
  status: 'active' | 'alert';
  category: 'military' | 'surveillance' | 'cargo' | 'tanker';
}

const mockFlights: FlightData[] = [
  { id: 'f1', callsign: 'FORTE12', type: 'RQ-4B Global Hawk', lat: 34.2, lng: 33.8, altitude: 'FL550', speed: '310 kts', heading: 135, origin: 'Sigonella', status: 'active', category: 'surveillance' },
  { id: 'f2', callsign: 'HOMER71', type: 'RC-135W Rivet Joint', lat: 36.1, lng: 34.5, altitude: 'FL340', speed: '420 kts', heading: 90, origin: 'RAF Mildenhall', status: 'active', category: 'surveillance' },
  { id: 'f3', callsign: 'LAGR223', type: 'KC-135R Stratotanker', lat: 33.8, lng: 36.2, altitude: 'FL280', speed: '380 kts', heading: 150, origin: 'RAF Fairford', status: 'active', category: 'tanker' },
  { id: 'f4', callsign: 'RCH4501', type: 'C-17A Globemaster', lat: 35.5, lng: 38.0, altitude: 'FL310', speed: '450 kts', heading: 90, origin: 'Ramstein', status: 'active', category: 'cargo' },
  { id: 'f5', callsign: 'DUKE01', type: 'F-15E Strike Eagle', lat: 32.5, lng: 35.0, altitude: 'FL250', speed: '520 kts', heading: 180, origin: 'RAF Lakenheath', status: 'alert', category: 'military' },
  { id: 'f6', callsign: 'VIPER22', type: 'F-16C Fighting Falcon', lat: 37.0, lng: 35.3, altitude: 'FL220', speed: '490 kts', heading: 145, origin: 'Incirlik', status: 'active', category: 'military' },
];

// ── Maritime mock data ──
interface VesselData {
  id: string;
  name: string;
  type: string;
  flag: string;
  lat: number;
  lng: number;
  status: 'underway' | 'anchored' | 'blocked' | 'diverted';
  heading: number;
  speed: string;
  note?: string;
}

const mockVessels: VesselData[] = [
  { id: 'v1', name: 'MSC ANNA', type: 'Container Ship', flag: '🇱🇷', lat: 12.8, lng: 43.3, status: 'diverted', heading: 315, speed: '14.2 kts', note: 'Diverted — Houthi threat' },
  { id: 'v2', name: 'USS EISENHOWER', type: 'CVN-69', flag: '🇺🇸', lat: 33.5, lng: 32.0, status: 'underway', heading: 90, speed: '18.5 kts' },
  { id: 'v3', name: 'EVER GIVEN', type: 'Container Ship', flag: '🇵🇦', lat: 31.25, lng: 32.31, status: 'anchored', heading: 0, speed: '0 kts', note: 'Holding — Suez transit delayed' },
  { id: 'v4', name: 'INS KOLKATA', type: 'Destroyer (D63)', flag: '🇮🇳', lat: 12.5, lng: 45.0, status: 'underway', heading: 270, speed: '22.1 kts', note: 'Anti-piracy patrol' },
  { id: 'v5', name: 'STENA IMPERO', type: 'Tanker', flag: '🇬🇧', lat: 26.6, lng: 56.2, status: 'blocked', heading: 0, speed: '0 kts', note: 'IRGC interdiction zone' },
  { id: 'v6', name: 'JS IZUMO', type: 'DDH-183', flag: '🇯🇵', lat: 18.0, lng: 60.0, status: 'underway', heading: 315, speed: '16.8 kts' },
];

const eventColorMap: Record<string, string> = {
  'ops-red': '#e04040',
  'ops-amber': '#d4952a',
  'ops-blue': '#4a8fd4',
  'ops-green': '#3ab54a',
  'ops-cyan': '#1ac8db',
};

const flightCategoryColor: Record<string, string> = {
  military: '#e04040',
  surveillance: '#1ac8db',
  cargo: '#3ab54a',
  tanker: '#d4952a',
};

const vesselStatusColor: Record<string, string> = {
  underway: '#3ab54a',
  anchored: '#d4952a',
  blocked: '#e04040',
  diverted: '#e04040',
};

type MapLayer = 'events' | 'flights' | 'maritime';

interface UnifiedMapProps {
  events: ConflictEvent[];
  onEventSelect?: (event: ConflictEvent) => void;
}

export default function UnifiedMap({ events, onEventSelect }: UnifiedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroups = useRef<Record<MapLayer, L.LayerGroup>>({
    events: L.layerGroup(),
    flights: L.layerGroup(),
    maritime: L.layerGroup(),
  });
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(new Set(['events']));
  const [stats, setStats] = useState({ events: events.length, flights: mockFlights.length, vessels: mockVessels.length });

  const toggleLayer = useCallback((layer: MapLayer) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [28, 40],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Add all layer groups to map
    Object.values(layerGroups.current).forEach(lg => lg.addTo(map));

    mapInstance.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Populate event markers
  useEffect(() => {
    const lg = layerGroups.current.events;
    lg.clearLayers();

    events.forEach(event => {
      const config = EVENT_TYPE_CONFIG[event.type];
      const color = eventColorMap[config?.color || 'ops-cyan'] || '#1ac8db';
      const credConfig = CREDIBILITY_CONFIG[event.credibility];

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:10px;height:10px;background:${color};border:2px solid ${color}88;border-radius:50%;box-shadow:0 0 10px ${color}66;animation:pulse-dot 2s ease-in-out infinite;"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      const marker = L.marker([event.location.lat, event.location.lng], { icon });
      
      const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      marker.bindPopup(`
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;min-width:180px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="color:${color};font-size:9px;font-weight:bold;letter-spacing:0.1em;">${config.label}</span>
            <span style="color:#666;font-size:9px;">${formatTime(event.timestamp)}</span>
          </div>
          <p style="font-weight:600;margin:4px 0;color:#d4d4d4;font-size:11px;line-height:1.3;">${event.title}</p>
          <p style="color:#888;font-size:9px;">${event.location.name}</p>
          <div style="display:flex;align-items:center;gap:4px;margin-top:6px;">
            <span style="color:${eventColorMap[credConfig.color]};font-size:8px;letter-spacing:0.1em;">${credConfig.label}</span>
            <span style="color:#666;font-size:8px;">— ${event.source}</span>
          </div>
        </div>
      `);
      marker.on('click', () => onEventSelect?.(event));

      if (event.type === 'airstrike' || event.type === 'ground_operation') {
        L.circle([event.location.lat, event.location.lng], {
          radius: 15000, color, fillColor: color, fillOpacity: 0.06, weight: 1, opacity: 0.25,
        }).addTo(lg);
      }

      marker.addTo(lg);
    });
  }, [events, onEventSelect]);

  // Populate flight markers
  useEffect(() => {
    const lg = layerGroups.current.flights;
    lg.clearLayers();

    mockFlights.forEach(flight => {
      const color = flightCategoryColor[flight.category];
      const rotation = flight.heading;

      const icon = L.divIcon({
        className: 'flight-marker',
        html: `<div style="transform:rotate(${rotation}deg);color:${color};filter:drop-shadow(0 0 4px ${color}88);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
        </div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([flight.lat, flight.lng], { icon });
      marker.bindPopup(`
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;min-width:160px;">
          <div style="color:${color};font-size:10px;font-weight:bold;letter-spacing:0.1em;margin-bottom:4px;">${flight.callsign}</div>
          <p style="color:#d4d4d4;font-size:10px;">${flight.type}</p>
          <div style="color:#888;font-size:9px;margin-top:4px;display:flex;gap:8px;">
            <span>${flight.altitude}</span><span>${flight.speed}</span>
          </div>
          <p style="color:#666;font-size:9px;margin-top:2px;">${flight.origin}</p>
          ${flight.status === 'alert' ? '<p style="color:#e04040;font-size:9px;margin-top:4px;">⚠ ALERT STATUS</p>' : ''}
        </div>
      `);
      marker.addTo(lg);

      // Trail line
      const trailLen = 1.5;
      const rad = (flight.heading + 180) * Math.PI / 180;
      const endLat = flight.lat + Math.cos(rad) * trailLen;
      const endLng = flight.lng + Math.sin(rad) * trailLen;
      L.polyline([[flight.lat, flight.lng], [endLat, endLng]], {
        color, weight: 1, opacity: 0.3, dashArray: '4 4',
      }).addTo(lg);
    });
  }, []);

  // Populate maritime markers
  useEffect(() => {
    const lg = layerGroups.current.maritime;
    lg.clearLayers();

    mockVessels.forEach(vessel => {
      const color = vesselStatusColor[vessel.status];

      const icon = L.divIcon({
        className: 'vessel-marker',
        html: `<div style="transform:rotate(${vessel.heading}deg);color:${color};filter:drop-shadow(0 0 4px ${color}88);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 20l3.5-2h13L22 20M6.5 18V6a2 2 0 012-2h7a2 2 0 012 2v12M4 18l1-6h14l1 6"/></svg>
        </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([vessel.lat, vessel.lng], { icon });
      marker.bindPopup(`
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;min-width:160px;">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;">
            <span style="font-size:12px;">${vessel.flag}</span>
            <span style="color:#d4d4d4;font-size:10px;font-weight:bold;">${vessel.name}</span>
          </div>
          <p style="color:#888;font-size:10px;">${vessel.type}</p>
          <div style="color:${color};font-size:9px;font-weight:bold;text-transform:uppercase;margin-top:4px;">${vessel.status}</div>
          <div style="color:#888;font-size:9px;margin-top:2px;">${vessel.speed}</div>
          ${vessel.note ? `<p style="color:#d4952a;font-size:9px;margin-top:4px;font-style:italic;">⚠ ${vessel.note}</p>` : ''}
        </div>
      `);
      marker.addTo(lg);

      // Vessel range circle for blocked/diverted
      if (vessel.status === 'blocked' || vessel.status === 'diverted') {
        L.circle([vessel.lat, vessel.lng], {
          radius: 50000, color, fillColor: color, fillOpacity: 0.05, weight: 1, opacity: 0.25, dashArray: '6 4',
        }).addTo(lg);
      }
    });

    // Shipping lane highlight (Red Sea / Bab el-Mandeb)
    L.polyline([
      [30.0, 32.5], [27.5, 34.0], [22.0, 38.0], [14.0, 42.5], [12.5, 43.5], [11.5, 45.0]
    ], { color: '#4a8fd4', weight: 1.5, opacity: 0.2, dashArray: '8 6' }).addTo(lg);

    // Strait of Hormuz
    L.polyline([
      [26.0, 56.0], [26.5, 56.5], [27.0, 56.8]
    ], { color: '#e04040', weight: 2, opacity: 0.3, dashArray: '4 4' }).addTo(lg);
  }, []);

  // Toggle layer visibility
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    (Object.keys(layerGroups.current) as MapLayer[]).forEach(key => {
      const lg = layerGroups.current[key];
      if (activeLayers.has(key)) {
        if (!map.hasLayer(lg)) map.addLayer(lg);
      } else {
        if (map.hasLayer(lg)) map.removeLayer(lg);
      }
    });
  }, [activeLayers]);

  const layerButtons: { key: MapLayer; label: string; icon: React.ReactNode; count: number; color: string }[] = [
    { key: 'events', label: 'LIVE FEED', icon: <Crosshair className="w-3 h-3" />, count: stats.events, color: 'text-primary' },
    { key: 'flights', label: 'ADS-B', icon: <Plane className="w-3 h-3" />, count: stats.flights, color: 'text-ops-cyan' },
    { key: 'maritime', label: 'AIS', icon: <Anchor className="w-3 h-3" />, count: stats.vessels, color: 'text-ops-blue' },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden rounded border border-border">
      {/* HUD corners */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary z-[1000] pointer-events-none" />
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary z-[1000] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary z-[1000] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary z-[1000] pointer-events-none" />

      {/* Layer toggle bar */}
      <div className="absolute top-2 left-2 right-2 z-[1000] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded px-1.5 py-1">
            <Layers className="w-3 h-3 text-muted-foreground mr-1" />
            {layerButtons.map(btn => (
              <button
                key={btn.key}
                onClick={() => toggleLayer(btn.key)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-all ${
                  activeLayers.has(btn.key)
                    ? `${btn.color} bg-secondary border border-border`
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {btn.icon}
                <span className="hidden sm:inline">{btn.label}</span>
                <span className={`text-[9px] ${activeLayers.has(btn.key) ? 'opacity-100' : 'opacity-50'}`}>
                  {btn.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded px-2 py-1.5">
          <Radio className="w-2.5 h-2.5 text-ops-green pulse-dot" />
          <span className="text-[9px] text-ops-green font-bold tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Legend */}
      {activeLayers.has('flights') && (
        <div className="absolute bottom-8 left-2 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded p-2 space-y-1">
          <p className="text-[8px] text-muted-foreground tracking-wider mb-1">ADS-B LEGEND</p>
          {[
            { label: 'MILITARY', color: '#e04040' },
            { label: 'ISR', color: '#1ac8db' },
            { label: 'CARGO', color: '#3ab54a' },
            { label: 'TANKER', color: '#d4952a' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              <span className="text-[8px] text-foreground/70">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {activeLayers.has('maritime') && (
        <div className="absolute bottom-8 left-2 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded p-2 space-y-1" style={{ left: activeLayers.has('flights') ? '90px' : '8px' }}>
          <p className="text-[8px] text-muted-foreground tracking-wider mb-1">AIS LEGEND</p>
          {[
            { label: 'UNDERWAY', color: '#3ab54a' },
            { label: 'ANCHORED', color: '#d4952a' },
            { label: 'BLOCKED', color: '#e04040' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              <span className="text-[8px] text-foreground/70">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
