import { useRef, useCallback } from 'react';
import { ConflictEvent, EVENT_TYPE_CONFIG, CREDIBILITY_CONFIG, EventType } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Loader2, ChevronsDown, ExternalLink, MapPin, Plane, Crosshair, Rocket, Shield, Heart, Anchor, Wifi, FileText } from 'lucide-react';

const colorMap: Record<string, string> = {
  'ops-red': 'text-ops-red border-ops-red bg-ops-red/10',
  'ops-amber': 'text-ops-amber border-ops-amber bg-ops-amber/10',
  'ops-blue': 'text-ops-blue border-ops-blue bg-ops-blue/10',
  'ops-green': 'text-ops-green border-ops-green bg-ops-green/10',
  'ops-cyan': 'text-ops-cyan border-ops-cyan bg-ops-cyan/10',
};

const credTextColor: Record<string, string> = {
  'ops-green': 'text-ops-green',
  'ops-cyan': 'text-ops-cyan',
  'ops-amber': 'text-ops-amber',
  'ops-red': 'text-ops-red',
};

const dotColor: Record<string, string> = {
  'ops-red': 'bg-ops-red',
  'ops-amber': 'bg-ops-amber',
  'ops-blue': 'bg-ops-blue',
  'ops-green': 'bg-ops-green',
  'ops-cyan': 'bg-ops-cyan',
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

interface EventTimelineProps {
  events: ConflictEvent[];
  onEventSelect?: (event: ConflictEvent) => void;
  onEventHover?: (eventId: string | null) => void;
  highlightedEventId?: string | null;
  loading?: boolean;
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function EventTimeline({ events, onEventSelect, onEventHover, highlightedEventId, loading }: EventTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
    el.parentElement?.classList.toggle('scrolled-bottom', isAtBottom);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h2 className="text-[11px] font-bold tracking-widest text-primary glow-text-cyan">NEWS LIVE</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {loading ? 'Loading...' : `${events.length} events`}
          </span>
          {events.length > 0 && (
            <ChevronsDown className="w-3 h-3 text-primary/50 animate-bounce" />
          )}
        </div>
      </div>
      <div className="scroll-fade-container flex-1 overflow-hidden">
        <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-[10px] text-muted-foreground tracking-wider">FETCHING LIVE EVENTS...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-[10px] text-muted-foreground tracking-wider">NO EVENTS FOUND</span>
          </div>
        ) : (
          events.map((event, i) => {
            const typeConfig = EVENT_TYPE_CONFIG[event.type] || { label: 'EVENT', color: 'ops-cyan' };
            const credConfig = CREDIBILITY_CONFIG[event.credibility] || { label: 'UNCONFIRMED', color: 'ops-amber' };
            const colors = colorMap[typeConfig.color] || colorMap['ops-cyan'];
            const dot = dotColor[typeConfig.color] || dotColor['ops-cyan'];
            const Icon = eventIcons[event.type] || FileText;
            const isHighlighted = highlightedEventId === event.id;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onMouseEnter={() => onEventHover?.(event.id)}
                onMouseLeave={() => onEventHover?.(null)}
                onClick={() => onEventSelect?.(event)}
                className={`cursor-pointer border-b border-border/50 transition-all ${
                  isHighlighted
                    ? 'bg-primary/10 border-l-2 border-l-primary'
                    : 'hover:bg-secondary/40 border-l-2 border-l-transparent'
                }`}
              >
                <div className="px-3 py-2.5">
                  {/* Time + Source row */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${credTextColor[typeConfig.color] || 'text-muted-foreground'}`} />
                      <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${colors}`}>
                        {typeConfig.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/70">
                      {timeAgo(event.timestamp)}
                    </span>
                  </div>

                  {/* Title */}
                  <p className={`text-xs leading-snug font-medium transition-colors ${
                    isHighlighted ? 'text-primary' : 'text-foreground/90'
                  }`}>
                    {event.title}
                  </p>

                  {/* Location + Source + Credibility */}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="w-2.5 h-2.5" />
                      {event.location.name}
                    </span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[10px] text-muted-foreground">{event.source}</span>
                    <span className={`text-[9px] tracking-wider font-medium ml-auto ${credTextColor[credConfig.color] || 'text-muted-foreground'}`}>
                      {credConfig.label}
                    </span>
                  </div>

                  {/* Casualties if any */}
                  {event.casualties && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className="text-[9px] text-ops-red font-medium">
                        ⚠ {event.casualties.reported} casualties reported
                        {!event.casualties.verified && ' (unverified)'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
}
