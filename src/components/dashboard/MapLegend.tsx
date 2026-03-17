import { useState } from 'react';
import { ChevronDown, ChevronUp, Plane, Crosshair, Rocket, Shield, Heart, Anchor, Wifi, FileText } from 'lucide-react';
import { EVENT_TYPE_CONFIG, EventType } from '@/data/mockData';

const eventColorHex: Record<string, string> = {
  'ops-red': '#e04040',
  'ops-amber': '#d4952a',
  'ops-blue': '#4a8fd4',
  'ops-green': '#3ab54a',
  'ops-cyan': '#1ac8db',
};

const eventIcons: Record<EventType, React.ElementType> = {
  airstrike: Plane,
  ground_operation: Crosshair,
  rocket_attack: Rocket,
  diplomatic: Shield,
  humanitarian: Heart,
  naval: Anchor,
  cyber: Wifi,
  general: FileText,
};

interface MapLegendProps {
  activeFilters?: EventType[];
  onToggleFilter?: (type: EventType) => void;
}

export default function MapLegend({ activeFilters, onToggleFilter }: MapLegendProps) {
  const [expanded, setExpanded] = useState(true);

  const entries = Object.entries(EVENT_TYPE_CONFIG) as [EventType, { label: string; color: string }][];

  return (
    <div className="absolute bottom-12 left-2 z-[500]">
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded shadow-lg overflow-hidden" style={{ minWidth: 140 }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full px-2.5 py-1.5 text-[9px] font-bold tracking-widest text-primary hover:bg-secondary/50 transition-colors"
        >
          <span>LEGEND</span>
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>

        {expanded && (
          <div className="px-2 pb-2 space-y-0.5">
            {entries.map(([type, config]) => {
              const Icon = eventIcons[type];
              const color = eventColorHex[config.color] || '#4a8fd4';
              const isActive = !activeFilters || activeFilters.includes(type);

              return (
                <button
                  key={type}
                  onClick={() => onToggleFilter?.(type)}
                  className={`flex items-center gap-2 w-full px-1.5 py-1 rounded text-left transition-all hover:bg-secondary/40 ${
                    isActive ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" style={{ color }} />
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}66` }} />
                  <span className="text-[9px] tracking-wider text-foreground/80">{config.label}</span>
                </button>
              );
            })}

            {/* Zone indicator */}
            <div className="flex items-center gap-2 px-1.5 py-1 mt-1 border-t border-border/50 pt-1.5">
              <div className="w-3 h-3 rounded-full border border-ops-red/40 bg-ops-red/10 shrink-0" />
              <span className="text-[9px] tracking-wider text-foreground/60">IMPACT ZONE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
