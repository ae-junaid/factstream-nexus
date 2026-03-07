import { ConflictEvent, EVENT_TYPE_CONFIG, CREDIBILITY_CONFIG } from '@/data/mockData';
import { X, MapPin, Clock, Shield, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colorMap: Record<string, string> = {
  'ops-red': 'text-ops-red',
  'ops-amber': 'text-ops-amber',
  'ops-blue': 'text-ops-blue',
  'ops-green': 'text-ops-green',
  'ops-cyan': 'text-ops-cyan',
};

interface EventDetailProps {
  event: ConflictEvent | null;
  onClose: () => void;
}

export default function EventDetail({ event, onClose }: EventDetailProps) {
  if (!event) return null;

  const typeConfig = EVENT_TYPE_CONFIG[event.type];
  const credConfig = CREDIBILITY_CONFIG[event.credibility];

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: false,
      month: 'short', day: 'numeric',
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute bottom-4 left-4 right-4 z-[1000] bg-card border border-border rounded p-4 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold tracking-wider ${colorMap[typeConfig.color]}`}>
            {typeConfig.label}
          </span>
          <span className={`text-[10px] font-medium ${colorMap[credConfig.color]}`}>
            [{credConfig.label}]
          </span>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-2">{event.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{event.description}</p>

        <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location.name}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(event.timestamp)}</span>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{event.source}</span>
          {event.casualties && (
            <span className="flex items-center gap-1 text-ops-amber">
              <AlertTriangle className="w-3 h-3" />
              {event.casualties.reported} reported {event.casualties.verified ? '(verified)' : '(unverified)'}
            </span>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-border">
          <p className="text-[9px] text-muted-foreground italic">
            ⚠ All data sourced from open channels. Casualty figures are reported, not independently verified unless stated.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
