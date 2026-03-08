import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ConflictEvent, EVENT_TYPE_CONFIG, CREDIBILITY_CONFIG } from '@/data/mockData';
import { ConflictZone } from '@/lib/conflicts';
import { Anchor, Crosshair, Layers, Maximize2, Minimize2, Radio } from 'lucide-react';

const eventColorMap: Record<string, string> = {
  'ops-red': '#e04040',
  'ops-amber': '#d4952a',
  'ops-blue': '#4a8fd4',
  'ops-green': '#3ab54a',
  'ops-cyan': '#1ac8db',
};

// Mock maritime vessel positions per conflict zone
const MARITIME_DATA: Record<string, Array<{ name: string; type: string; flag: string; lat: number; lng: number; heading: number; speed: string; status: string; note?: string }>> = {
  'iran-israel': [
    { name: 'USS EISENHOWER', type: 'Aircraft Carrier CVN-69', flag: 'US', lat: 34.2, lng: 33.5, heading: 90, speed: '18.5 kts', status: 'underway', note: 'Carrier Strike Group' },
    { name: 'MSC ANNA', type: 'Container Ship', flag: 'LR', lat: 13.5, lng: 43.2, heading: 315, speed: '14.2 kts', status: 'diverted', note: 'Diverted — Houthi threat' },
    { name: 'INS KOLKATA', type: 'Destroyer D63', flag: 'IN', lat: 12.8, lng: 45.0, heading: 270, speed: '22.1 kts', status: 'underway', note: 'Anti-piracy patrol' },
    { name: 'STENA IMPERO', type: 'Oil Tanker', flag: 'GB', lat: 26.6, lng: 56.3, heading: 0, speed: '0 kts', status: 'blocked', note: 'IRGC interdiction zone' },
    { name: 'EVER GIVEN', type: 'Container Ship', flag: 'PA', lat: 31.25, lng: 32.31, heading: 0, speed: '0 kts', status: 'anchored', note: 'Suez transit delayed' },
    { name: 'JS IZUMO', type: 'Helicopter Carrier DDH-183', flag: 'JP', lat: 18.5, lng: 58.2, heading: 315, speed: '16.8 kts', status: 'underway' },
  ],
  'ukraine-russia': [
    { name: 'MOSKVA II', type: 'Guided Missile Cruiser', flag: 'RU', lat: 44.5, lng: 33.5, heading: 180, speed: '12 kts', status: 'underway', note: 'Black Sea Fleet' },
    { name: 'TCG ANADOLU', type: 'Amphibious Assault Ship', flag: 'TR', lat: 41.0, lng: 29.0, heading: 45, speed: '14 kts', status: 'underway', note: 'Bosphorus patrol' },
    { name: 'NORD STREAM SURVEY', type: 'Survey Vessel', flag: 'NO', lat: 54.8, lng: 15.5, heading: 90, speed: '4 kts', status: 'underway', note: 'Pipeline inspection' },
    { name: 'USS ROSS', type: 'Destroyer DDG-71', flag: 'US', lat: 43.5, lng: 30.0, heading: 270, speed: '20 kts', status: 'underway', note: 'NATO presence' },
  ],
  'yemen-red-sea': [
    { name: 'USS CARNEY', type: 'Destroyer DDG-64', flag: 'US', lat: 14.0, lng: 42.8, heading: 180, speed: '22 kts', status: 'underway', note: 'Houthi intercept ops' },
    { name: 'GALAXY LEADER', type: 'Cargo Ship', flag: 'BH', lat: 14.8, lng: 42.9, heading: 0, speed: '0 kts', status: 'blocked', note: 'Seized by Houthis' },
    { name: 'HMS DIAMOND', type: 'Destroyer D34', flag: 'GB', lat: 13.5, lng: 43.5, heading: 90, speed: '18 kts', status: 'underway', note: 'Op Prosperity Guardian' },
    { name: 'MAERSK HANGZHOU', type: 'Container Ship', flag: 'DK', lat: 12.6, lng: 44.0, heading: 315, speed: '16 kts', status: 'diverted', note: 'Diverted via Cape route' },
  ],
  'sudan': [
    { name: 'DIGNITY', type: 'Aid Ship', flag: 'UN', lat: 19.6, lng: 37.2, heading: 270, speed: '10 kts', status: 'underway', note: 'UNHCR humanitarian aid' },
    { name: 'PORT SUDAN CARGO', type: 'Bulk Carrier', flag: 'EG', lat: 19.6, lng: 37.5, heading: 0, speed: '0 kts', status: 'anchored', note: 'Port Sudan anchorage' },
  ],
  'myanmar': [
    { name: 'UMS KYAN SITTHA', type: 'Frigate', flag: 'MM', lat: 16.5, lng: 96.5, heading: 180, speed: '12 kts', status: 'underway', note: 'Myanmar Navy patrol' },
    { name: 'INS SAHYADRI', type: 'Frigate F49', flag: 'IN', lat: 14.0, lng: 93.0, heading: 90, speed: '16 kts', status: 'underway', note: 'Bay of Bengal patrol' },
  ],
};

type MapLayer = 'events' | 'maritime';

interface UnifiedMapProps {
  events: ConflictEvent[];
  onEventSelect?: (event: ConflictEvent) => void;
  conflict: ConflictZone;
}

export default function UnifiedMap({ events, onEventSelect, conflict }: UnifiedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const layerGroups = useRef<Record<MapLayer, L.LayerGroup>>({
    events: L.layerGroup(),
    maritime: L.layerGroup(),
  });
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(new Set(['events', 'maritime']));

  const vessels = MARITIME_DATA[conflict?.id] || [];

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
      center: conflict.center,
      zoom: conflict.zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const isDark = !document.documentElement.classList.contains('light');
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
    tileLayerRef.current = tileLayer;

    Object.values(layerGroups.current).forEach(lg => lg.addTo(map));
    mapInstance.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    const observer = new MutationObserver(() => {
      const isNowDark = !document.documentElement.classList.contains('light');
      const newUrl = isNowDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      if (tileLayerRef.current) tileLayerRef.current.setUrl(newUrl);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setView(conflict.center, conflict.zoom, { animate: true });
    }
  }, [conflict.id]);

  // Event markers
  useEffect(() => {
    const lg = layerGroups.current.events;
    lg.clearLayers();

    events.forEach(event => {
      const config = EVENT_TYPE_CONFIG[event.type] || { label: 'EVENT', color: 'ops-cyan' };
      const color = eventColorMap[config.color] || '#1ac8db';
      const credConfig = CREDIBILITY_CONFIG[event.credibility] || { label: 'UNCONFIRMED', color: 'ops-amber' };

      if (!event.location.lat || !event.location.lng) return;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:10px;height:10px;background:${color};border:2px solid ${color}88;border-radius:50%;box-shadow:0 0 10px ${color}66;"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      const marker = L.marker([event.location.lat, event.location.lng], { icon });
      marker.bindPopup(`
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;min-width:180px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="color:${color};font-size:9px;font-weight:bold;letter-spacing:0.1em;">${config.label}</span>
            <span style="color:${eventColorMap[credConfig.color] || '#d4952a'};font-size:8px;letter-spacing:0.1em;">${credConfig.label}</span>
          </div>
          <p style="font-weight:600;margin:4px 0;font-size:11px;line-height:1.3;">${event.title}</p>
          <p style="color:#888;font-size:9px;">${event.location.name}</p>
          <p style="color:#666;font-size:8px;margin-top:4px;">— ${event.source}</p>
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

  // Maritime markers
  useEffect(() => {
    const lg = layerGroups.current.maritime;
    lg.clearLayers();

    vessels.forEach(vessel => {
      const statusColor = vessel.status === 'blocked' || vessel.status === 'diverted' ? '#e04040'
        : vessel.status === 'anchored' ? '#d4952a' : '#4a8fd4';

      const icon = L.divIcon({
        className: 'maritime-marker',
        html: `<div style="transform:rotate(${vessel.heading}deg);color:${statusColor};filter:drop-shadow(0 0 4px ${statusColor}88);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10V4.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V10"/></svg>
        </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([vessel.lat, vessel.lng], { icon });
      marker.bindPopup(`
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;min-width:200px;">
          <div style="margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #333;">
            <span style="color:${statusColor};font-size:12px;font-weight:bold;">${vessel.flag} ${vessel.name}</span>
          </div>
          <table style="width:100%;font-size:9px;">
            <tr><td style="color:#666;">Type</td><td style="text-align:right;">${vessel.type}</td></tr>
            <tr><td style="color:#666;">Status</td><td style="text-align:right;color:${statusColor};font-weight:bold;">${vessel.status.toUpperCase()}</td></tr>
            <tr><td style="color:#666;">Speed</td><td style="text-align:right;">${vessel.speed}</td></tr>
            <tr><td style="color:#666;">Heading</td><td style="text-align:right;">${vessel.heading}°</td></tr>
          </table>
          ${vessel.note ? `<p style="color:#d4952a;font-size:9px;margin-top:6px;font-style:italic;">⚠ ${vessel.note}</p>` : ''}
          <div style="margin-top:6px;padding-top:4px;border-top:1px solid #333;color:#555;font-size:8px;text-align:center;">SOURCE: AIS MARITIME DATA</div>
        </div>
      `);
      marker.addTo(lg);

      // Add range ring for military vessels
      if (vessel.type.includes('Carrier') || vessel.type.includes('Destroyer') || vessel.type.includes('Frigate') || vessel.type.includes('Cruiser')) {
        L.circle([vessel.lat, vessel.lng], {
          radius: 50000, color: statusColor, fillColor: statusColor, fillOpacity: 0.04, weight: 1, opacity: 0.2, dashArray: '4 4',
        }).addTo(lg);
      }
    });
  }, [vessels]);

  // Layer visibility
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
    { key: 'events', label: 'EVENTS', icon: <Crosshair className="w-3 h-3" />, count: events.length, color: 'text-primary' },
    { key: 'maritime', label: 'AIS', icon: <Anchor className="w-3 h-3" />, count: vessels.length, color: 'text-ops-blue' },
  ];

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
      setTimeout(() => mapInstance.current?.invalidateSize(), 100);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden rounded border border-border ${isFullscreen ? 'bg-background' : ''}`}>
      {/* HUD corners */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary z-[400] pointer-events-none" />
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary z-[400] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary z-[400] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary z-[400] pointer-events-none" />

      {/* Layer controls — lower z-index to avoid header dropdown clash */}
      <div className="absolute top-2 left-2 z-[500] flex items-center gap-1">
        <div className="flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded px-1.5 py-1">
          <Layers className="w-3 h-3 text-muted-foreground mr-1" />
          {layerButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => toggleLayer(btn.key)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-all ${
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

      {/* Right controls */}
      <div className="absolute top-2 right-2 z-[500] flex items-center gap-2">
        <button
          onClick={() => {
            const el = containerRef.current;
            if (!el) return;
            if (!document.fullscreenElement) {
              el.requestFullscreen().then(() => setIsFullscreen(true));
            } else {
              document.exitFullscreen().then(() => setIsFullscreen(false));
            }
          }}
          className="flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </button>
        <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded px-2 py-1.5">
          <Radio className="w-2.5 h-2.5 text-ops-green pulse-dot" />
          <span className="text-[9px] text-ops-green font-bold tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Loading indicator */}
      {flightsLoading && activeLayers.has('flights') && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[500] bg-card/90 backdrop-blur-sm border border-border rounded px-3 py-1.5 flex items-center gap-2">
          <Loader2 className="w-3 h-3 text-primary animate-spin" />
          <span className="text-[9px] text-muted-foreground tracking-wider">LOADING ADS-B...</span>
        </div>
      )}

      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
