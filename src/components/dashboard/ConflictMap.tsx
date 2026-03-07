import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ConflictEvent, EVENT_TYPE_CONFIG, CREDIBILITY_CONFIG } from '@/data/mockData';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const eventColorMap: Record<string, string> = {
  'ops-red': '#e04040',
  'ops-amber': '#d4952a',
  'ops-blue': '#4a8fd4',
  'ops-green': '#3ab54a',
  'ops-cyan': '#1ac8db',
};

const createEventIcon = (type: string) => {
  const config = EVENT_TYPE_CONFIG[type as keyof typeof EVENT_TYPE_CONFIG];
  const color = eventColorMap[config?.color || 'ops-cyan'] || '#1ac8db';

  return L.divIcon({
    className: 'custom-event-marker',
    html: `<div style="
      width: 14px; height: 14px;
      background: ${color};
      border: 2px solid ${color}88;
      border-radius: 50%;
      box-shadow: 0 0 12px ${color}66, 0 0 24px ${color}33;
      animation: pulse-dot 2s ease-in-out infinite;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

function MapBounds({ events }: { events: ConflictEvent[] }) {
  const map = useMap();
  const boundsSet = useRef(false);

  useEffect(() => {
    if (events.length > 0 && !boundsSet.current) {
      const bounds = L.latLngBounds(events.map(e => [e.location.lat, e.location.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
      boundsSet.current = true;
    }
  }, [events, map]);

  return null;
}

interface ConflictMapProps {
  events: ConflictEvent[];
  onEventSelect?: (event: ConflictEvent) => void;
}

export default function ConflictMap({ events, onEventSelect }: ConflictMapProps) {
  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="relative h-full w-full rounded border border-border overflow-hidden">
      {/* HUD overlay corners */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary z-[1000] pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary z-[1000] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary z-[1000] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary z-[1000] pointer-events-none" />

      {/* Map status bar */}
      <div className="absolute top-2 left-8 z-[1000] pointer-events-none">
        <div className="flex items-center gap-2 text-[10px] text-primary font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-primary pulse-dot" />
          <span className="glow-text-cyan">LIVE FEED</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">{events.length} EVENTS TRACKED</span>
        </div>
      </div>

      <MapContainer
        center={[31.5, 35.5]}
        zoom={6}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapBounds events={events} />

        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.location.lat, event.location.lng]}
            icon={createEventIcon(event.type)}
            eventHandlers={{
              click: () => onEventSelect?.(event),
            }}
          >
            <Popup>
              <div className="font-mono text-xs space-y-1 min-w-[200px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: eventColorMap[EVENT_TYPE_CONFIG[event.type].color] }}>
                    {EVENT_TYPE_CONFIG[event.type].label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{formatTime(event.timestamp)}</span>
                </div>
                <p className="font-semibold text-foreground text-xs leading-tight">{event.title}</p>
                <p className="text-muted-foreground text-[10px] leading-snug">{event.location.name}</p>
                <div className="flex items-center gap-1 pt-1">
                  <span className="text-[9px] tracking-wider" style={{ color: eventColorMap[CREDIBILITY_CONFIG[event.credibility].color] }}>
                    {CREDIBILITY_CONFIG[event.credibility].label}
                  </span>
                  <span className="text-muted-foreground text-[9px]">— {event.source}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Conflict zone circles */}
        {events.filter(e => e.type === 'airstrike' || e.type === 'ground_operation').map(event => (
          <Circle
            key={`zone-${event.id}`}
            center={[event.location.lat, event.location.lng]}
            radius={15000}
            pathOptions={{
              color: eventColorMap[EVENT_TYPE_CONFIG[event.type].color],
              fillColor: eventColorMap[EVENT_TYPE_CONFIG[event.type].color],
              fillOpacity: 0.08,
              weight: 1,
              opacity: 0.3,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
