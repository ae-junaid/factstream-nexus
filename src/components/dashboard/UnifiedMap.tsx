import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ConflictEvent, EVENT_TYPE_CONFIG, CREDIBILITY_CONFIG, EventType } from '@/data/mockData';
import { ConflictZone } from '@/lib/conflicts';
import { Crosshair, Maximize2, Minimize2, Radio } from 'lucide-react';
import MapLegend from './MapLegend';
import TimelineSlider from './TimelineSlider';

const eventColorMap: Record<string, string> = {
  'ops-red': '#e04040',
  'ops-amber': '#d4952a',
  'ops-blue': '#4a8fd4',
  'ops-green': '#3ab54a',
  'ops-cyan': '#1ac8db',
};

interface UnifiedMapProps {
  events: ConflictEvent[];
  onEventSelect?: (event: ConflictEvent) => void;
  conflict: ConflictZone;
  highlightedEventId?: string | null;
}

export default function UnifiedMap({ events, onEventSelect, conflict, highlightedEventId }: UnifiedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const eventsLayer = useRef<L.LayerGroup>(L.layerGroup());
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [activeFilters, setActiveFilters] = useState<EventType[] | undefined>(undefined);
  const [timeRange, setTimeRange] = useState<[Date, Date] | null>(null);

  const toggleFilter = useCallback((type: EventType) => {
    setActiveFilters(prev => {
      if (!prev) {
        // First click: show only this type
        const allTypes = Object.keys(EVENT_TYPE_CONFIG) as EventType[];
        return allTypes.filter(t => t !== type);
      }
      if (prev.includes(type)) {
        const next = prev.filter(t => t !== type);
        return next.length === 0 ? undefined : next; // if nothing filtered, show all
      }
      const next = [...prev, type];
      if (next.length === Object.keys(EVENT_TYPE_CONFIG).length) return undefined;
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

    eventsLayer.current.addTo(map);
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

  // Filter events by type and time
  const filteredEvents = events.filter(event => {
    if (activeFilters && !activeFilters.includes(event.type)) return false;
    if (timeRange) {
      const t = new Date(event.timestamp).getTime();
      if (t < timeRange[0].getTime() || t > timeRange[1].getTime()) return false;
    }
    return true;
  });

  // Event markers
  useEffect(() => {
    const lg = eventsLayer.current;
    lg.clearLayers();
    markersRef.current.clear();

    filteredEvents.forEach(event => {
      const config = EVENT_TYPE_CONFIG[event.type] || { label: 'EVENT', color: 'ops-cyan' };
      const color = eventColorMap[config.color] || '#1ac8db';
      const credConfig = CREDIBILITY_CONFIG[event.credibility] || { label: 'UNCONFIRMED', color: 'ops-amber' };

      if (!event.location.lat || !event.location.lng) return;

      const isHighlighted = highlightedEventId === event.id;
      const size = isHighlighted ? 16 : 10;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:${isHighlighted ? '3' : '2'}px solid ${isHighlighted ? '#fff' : color + '88'};border-radius:50%;box-shadow:0 0 ${isHighlighted ? '20' : '10'}px ${color}${isHighlighted ? '' : '66'};transition:all 0.3s;"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([event.location.lat, event.location.lng], { icon, zIndexOffset: isHighlighted ? 1000 : 0 });
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
      markersRef.current.set(event.id, marker);
    });
  }, [filteredEvents, onEventSelect, highlightedEventId]);

  // Pan to highlighted event
  useEffect(() => {
    if (!highlightedEventId || !mapInstance.current) return;
    const marker = markersRef.current.get(highlightedEventId);
    if (marker) {
      const ll = marker.getLatLng();
      mapInstance.current.setView(ll, Math.max(mapInstance.current.getZoom(), 6), { animate: true });
      marker.openPopup();
    }
  }, [highlightedEventId]);

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

      {/* Top info */}
      <div className="absolute top-2 left-2 z-[500] flex items-center gap-1">
        <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded px-2 py-1">
          <Crosshair className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-bold tracking-wider text-primary">
            {filteredEvents.length}{filteredEvents.length !== events.length ? `/${events.length}` : ''} EVENTS
          </span>
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

      {/* Legend */}
      <MapLegend activeFilters={activeFilters} onToggleFilter={toggleFilter} />

      {/* Timeline slider */}
      <TimelineSlider events={events} onRangeChange={setTimeRange} />

      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
