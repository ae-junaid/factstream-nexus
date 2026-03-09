import { useRef, useCallback } from 'react';
import { ConflictEvent, EVENT_TYPE_CONFIG, CREDIBILITY_CONFIG } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Loader2, ChevronsDown } from 'lucide-react';

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

interface EventTimelineProps {
  events: ConflictEvent[];
  onEventSelect?: (event: ConflictEvent) => void;
  loading?: boolean;
}

export default function EventTimeline({ events, onEventSelect, loading }: EventTimelineProps) {
  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return '--:--';
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h2 className="text-[11px] font-bold tracking-widest text-primary glow-text-cyan">EVENT TIMELINE</h2>
        <span className="text-[10px] text-muted-foreground">
          {loading ? 'Loading...' : `${events.length} events`}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
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

            return (
              <motion.button
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onEventSelect?.(event)}
                className="w-full text-left p-2 rounded border border-border/50 hover:border-primary/30 hover:bg-secondary/50 transition-all group"
              >
                <div className="flex items-start gap-2">
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <div className={`w-2 h-2 rounded-full ${dot} ${i === 0 ? 'pulse-dot' : ''}`} />
                    {i < events.length - 1 && <div className="w-px h-6 bg-border" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${colors}`}>
                        {typeConfig.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{formatTime(event.timestamp)}</span>
                      <span className={`text-[9px] tracking-wider font-medium ${credTextColor[credConfig.color] || 'text-muted-foreground'}`}>
                        {credConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-foreground mt-1 leading-snug group-hover:text-primary transition-colors truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground truncate">{event.location.name}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{event.source}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
