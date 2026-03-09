import { useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ChevronUp, Loader2, Activity, ChevronsDown } from 'lucide-react';
import { ConflictZone } from '@/lib/conflicts';
import { ConflictEvent } from '@/data/mockData';

interface ThreatZone {
  id: string;
  region: string;
  level: 'critical' | 'high' | 'elevated' | 'moderate';
  description: string;
  eventCount: number;
}

const levelConfig: Record<string, { color: string; bg: string; bar: string; badge: string; icon: string }> = {
  critical: {
    color: 'text-ops-red',
    bg: 'border-ops-red/30',
    bar: 'bg-ops-red',
    badge: 'bg-ops-red/15 text-ops-red border-ops-red/30',
    icon: '🔴',
  },
  high: {
    color: 'text-ops-amber',
    bg: 'border-ops-amber/25',
    bar: 'bg-ops-amber',
    badge: 'bg-ops-amber/15 text-ops-amber border-ops-amber/25',
    icon: '🟠',
  },
  elevated: {
    color: 'text-ops-cyan',
    bg: 'border-border',
    bar: 'bg-ops-cyan',
    badge: 'bg-ops-cyan/10 text-ops-cyan border-ops-cyan/20',
    icon: '🔵',
  },
  moderate: {
    color: 'text-ops-green',
    bg: 'border-border',
    bar: 'bg-ops-green',
    badge: 'bg-ops-green/10 text-ops-green border-ops-green/20',
    icon: '🟢',
  },
};

const levelPercent: Record<string, number> = {
  critical: 100,
  high: 75,
  elevated: 50,
  moderate: 25,
};

interface ThreatAssessmentProps {
  conflict: ConflictZone;
  events?: ConflictEvent[];
  loading?: boolean;
}

export default function ThreatAssessment({ conflict, events = [], loading = false }: ThreatAssessmentProps) {

  const threats: ThreatZone[] = useMemo(() => {
    const regionMap: Record<string, number> = {};
    events.forEach(e => {
      const region = e.location.name || 'Unknown';
      regionMap[region] = (regionMap[region] || 0) + 1;
    });

    conflict.regions.forEach(r => {
      if (!regionMap[r]) regionMap[r] = 0;
    });

    const entries = Object.entries(regionMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);

    return entries.map(([region, count], i) => {
      let level: 'critical' | 'high' | 'elevated' | 'moderate' = 'moderate';
      if (count >= 5) level = 'critical';
      else if (count >= 3) level = 'high';
      else if (count >= 1) level = 'elevated';

      const typeBreakdown = events
        .filter(e => e.location.name === region)
        .map(e => e.type);
      const hasAirstrikes = typeBreakdown.includes('airstrike') || typeBreakdown.includes('rocket_attack');
      if (hasAirstrikes && level !== 'critical') level = 'high';

      return {
        id: `t-${i}`,
        region: region.length > 30 ? region.substring(0, 28) + '…' : region,
        level,
        description: count > 0
          ? `${count} event${count > 1 ? 's' : ''} — ${[...new Set(typeBreakdown)].slice(0, 2).join(', ') || 'monitoring'}`
          : 'Monitoring — no recent events',
        eventCount: count,
      };
    });
  }, [events, conflict.regions]);

  const criticalCount = threats.filter(t => t.level === 'critical' || t.level === 'high').length;
  const totalEvents = threats.reduce((sum, t) => sum + t.eventCount, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-ops-red/5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-ops-red/10 border border-ops-red/20">
            <ShieldAlert className="w-3 h-3 text-ops-red" />
          </div>
          <h2 className="text-[11px] font-bold tracking-widest text-ops-red">THREAT MATRIX</h2>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-3 h-3 text-ops-red animate-spin" />
          ) : (
            <>
              <span className="text-[9px] font-bold text-ops-red tracking-wider flex items-center gap-1">
                <ChevronUp className="w-3 h-3" />
                {criticalCount} HIGH+
              </span>
              <span className="text-[9px] text-muted-foreground">
                {totalEvents} total
              </span>
            </>
          )}
        </div>
      </div>

      {/* Threat cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && threats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-[10px] text-muted-foreground tracking-wider">ANALYZING THREATS...</span>
          </div>
        ) : (
          threats.map((threat, i) => {
            const config = levelConfig[threat.level];
            return (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`group rounded border ${config.bg} bg-card/50 hover:bg-secondary/30 transition-all`}
              >
                <div className="flex items-stretch">
                  {/* Left accent bar */}
                  <div className={`w-1 shrink-0 rounded-l ${config.bar}`} />

                  <div className="flex-1 px-2.5 py-2 min-w-0">
                    {/* Top row: region + badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-foreground tracking-wider truncate">
                        {threat.region}
                      </span>
                      <span className={`text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm border shrink-0 ${config.badge}`}>
                        {threat.level}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{threat.description}</p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-[3px] rounded-full bg-secondary/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${levelPercent[threat.level]}%` }}
                          transition={{ delay: i * 0.04 + 0.2, duration: 0.5 }}
                          className={`h-full rounded-full ${config.bar}`}
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Activity className={`w-2.5 h-2.5 ${config.color}`} />
                        <span className={`text-[8px] font-bold ${config.color}`}>{threat.eventCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
