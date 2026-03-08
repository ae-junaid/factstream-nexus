import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ConflictEvent, EVENT_TYPE_CONFIG, CREDIBILITY_CONFIG } from '@/data/mockData';
import { ConflictZone } from '@/lib/conflicts';
import { useOpenSkyFlights, LiveFlight } from '@/hooks/useOpenSkyData';
import { Plane, Anchor, Crosshair, Layers, Maximize2, Minimize2, Radio, Loader2 } from 'lucide-react';

const eventColorMap: Record<string, string> = {
  'ops-red': '#e04040',
  'ops-amber': '#d4952a',
  'ops-blue': '#4a8fd4',
  'ops-green': '#3ab54a',
  'ops-cyan': '#1ac8db',
};

type MapLayer = 'events' | 'flights';

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
  const layerGroups = useRef<Record<MapLayer, L.LayerGroup>>({
    events: L.layerGroup(),
    flights: L.layerGroup(),
  });
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(new Set(['events']));

  const { flights, loading: flightsLoading } = useOpenSkyFlights(conflict, 30000);

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

  // Re-center map on conflict change
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setView(conflict.center, conflict.zoom, { animate: true });
    }
  }, [conflict.id]);

  // Populate event markers
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

  // Populate live flight markers
  useEffect(() => {
    const lg = layerGroups.current.flights;
    lg.clearLayers();

    flights.forEach(flight => {
      if (!flight.lat || !flight.lng) return;

      const color = flight.callsign.match(/^(RCH|FORTE|HOMER|DUKE|VIPER|EVIL|RAGE)/i) ? '#e04040' : '#1ac8db';

      const icon = L.divIcon({
        className: 'flight-marker',
        html: `<div style="transform:rotate(${flight.heading}deg);color:${color};filter:drop-shadow(0 0 4px ${color}88);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
        </div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([flight.lat, flight.lng], { icon });
      marker.bindPopup(`
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;min-width:200px;">
          <div style="margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #333;">
            <span style="color:${color};font-size:12px;font-weight:bold;">${flight.callsign || flight.icao24}</span>
          </div>
          <table style="width:100%;font-size:9px;">
            <tr><td style="color:#666;">ICAO24</td><td style="text-align:right;">${flight.icao24}</td></tr>
            <tr><td style="color:#666;">Country</td><td style="text-align:right;">${flight.originCountry}</td></tr>
            <tr><td style="color:#666;">Altitude</td><td style="text-align:right;">${Math.round(flight.altitude * 3.281).toLocaleString()} ft</td></tr>
            <tr><td style="color:#666;">Speed</td><td style="text-align:right;">${flight.velocity} kts</td></tr>
            <tr><td style="color:#666;">Heading</td><td style="text-align:right;">${flight.heading}°</td></tr>
            <tr><td style="color:#666;">V/Rate</td><td style="text-align:right;">${flight.verticalRate > 0 ? '+' : ''}${flight.verticalRate} ft/min</td></tr>
            <tr><td style="color:#666;">Squawk</td><td style="text-align:right;">${flight.squawk}</td></tr>
          </table>
          <div style="margin-top:6px;padding-top:4px;border-top:1px solid #333;color:#555;font-size:8px;text-align:center;">
            SOURCE: ADSB.LOL · LIVE ADS-B
          </div>
        </div>
      `);
      marker.addTo(lg);
    });
  }, [flights]);

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
    { key: 'events', label: 'EVENTS', icon: <Crosshair className="w-3 h-3" />, count: events.length, color: 'text-primary' },
    { key: 'flights', label: 'ADS-B', icon: <Plane className="w-3 h-3" />, count: flights.length, color: 'text-ops-cyan' },
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

        <div className="flex items-center gap-2">
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
      </div>

      {/* Loading indicator */}
      {flightsLoading && activeLayers.has('flights') && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded px-3 py-1.5 flex items-center gap-2">
          <Loader2 className="w-3 h-3 text-primary animate-spin" />
          <span className="text-[9px] text-muted-foreground tracking-wider">LOADING ADS-B...</span>
        </div>
      )}

      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
