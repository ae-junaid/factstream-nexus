import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ChevronUp, Loader2 } from 'lucide-react';
import { ConflictZone } from '@/lib/conflicts';
import { useGdeltEvents } from '@/hooks/useGdeltData';

interface ThreatZone {
  id: string;
  region: string;
  level: 'critical' | 'high' | 'elevated' | 'moderate';
  description: string;
  eventCount: number;
}

const levelConfig: Record<string, { color: string; bg: string; bar: string }> = {
  critical: { color: 'text-ops-red', bg: 'bg-ops-red/10 border-ops-red/40', bar: 'bg-ops-red' },
  high: { color: 'text-ops-amber', bg: 'bg-ops-amber/10 border-ops-amber/30', bar: 'bg-ops-amber' },
  elevated: { color: 'text-ops-cyan', bg: 'bg-ops-cyan/10 border-ops-cyan/30', bar: 'bg-ops-cyan' },
  moderate: { color: 'text-ops-green', bg: 'bg-ops-green/10 border-ops-green/30', bar: 'bg-ops-green' },
};

const levelWidth: Record<string, string> = {
  critical: 'w-full',
  high: 'w-3/4',
  elevated: 'w-1/2',
  moderate: 'w-1/4',
};

interface ThreatAssessmentProps {
  conflict: ConflictZone;
}

export default function ThreatAssessment({ conflict }: ThreatAssessmentProps) {
  const { events, loading } = useGdeltEvents(conflict, 180000);

  const threats: ThreatZone[] = useMemo(() => {
    // Group events by region (location name) and derive threat levels
    const regionMap: Record<string, number> = {};
    events.forEach(e => {
      const region = e.location.name || 'Unknown';
      regionMap[region] = (regionMap[region] || 0) + 1;
    });

    // Also add conflict's predefined regions with base counts
    conflict.regions.forEach(r => {
      if (!regionMap[r]) regionMap[r] = 0;
    });

    const entries = Object.entries(regionMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

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
        region,
        level,
        description: count > 0
          ? `${count} event${count > 1 ? 's' : ''} detected — ${[...new Set(typeBreakdown)].join(', ') || 'monitoring'}`
          : 'Monitoring — no recent events',
        eventCount: count,
      };
    });
  }, [events, conflict.regions]);

  const criticalCount = threats.filter(t => t.level === 'critical' || t.level === 'high').length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-ops-red" />
          <h2 className="text-[11px] font-bold tracking-widest text-ops-red">THREAT MATRIX</h2>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-ops-red">
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <ChevronUp className="w-3 h-3" />
              <span>{criticalCount} HIGH+</span>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {loading && threats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-[10px] text-muted-foreground tracking-wider">ANALYZING THREATS...</span>
          </div>
        ) : (
          threats.map((threat, i) => {
            const config = levelConfig[threat.level];
            return (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`p-2 rounded border ${config.bg} transition-all`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground tracking-wider truncate">{threat.region}</span>
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${config.color}`}>{threat.level}</span>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1 truncate">{threat.description}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex-1 h-1 rounded-full bg-secondary mr-3">
                    <div className={`h-full rounded-full ${config.bar} ${levelWidth[threat.level]}`} />
                  </div>
                  <span className="text-[8px] text-muted-foreground shrink-0">{threat.eventCount} events</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
