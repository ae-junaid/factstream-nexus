import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Radar } from 'lucide-react';

interface AirspaceEntry {
  id: string;
  zone: string;
  type: string;
  detections: number;
  status: 'active' | 'restricted' | 'closed';
  notam?: string;
}

const mockAirspace: AirspaceEntry[] = [
  { id: 'a1', zone: 'LLBG FIR (Israel)', type: 'Combat Air Patrol', detections: 24, status: 'restricted', notam: 'NOTAM A0847/26 — Civilian traffic restricted' },
  { id: 'a2', zone: 'OLBB FIR (Lebanon)', type: 'Surveillance / ISR', detections: 8, status: 'closed', notam: 'NOTAM — Airspace closed to civilian ops' },
  { id: 'a3', zone: 'OSTT FIR (Syria)', type: 'Strike Packages', detections: 6, status: 'closed' },
  { id: 'a4', zone: 'ORBB FIR (Iraq)', type: 'CSAR / Tanker Ops', detections: 12, status: 'restricted' },
  { id: 'a5', zone: 'OIIX FIR (Iran)', type: 'Air Defense Active', detections: 3, status: 'active', notam: 'AD alert — S-300/S-400 active' },
];

const statusStyles: Record<string, { text: string; dot: string }> = {
  active: { text: 'text-ops-green', dot: 'bg-ops-green' },
  restricted: { text: 'text-ops-amber', dot: 'bg-ops-amber' },
  closed: { text: 'text-ops-red', dot: 'bg-ops-red' },
};

export default function AirspaceMonitor() {
  const [sweep, setSweep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSweep(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Radar className="w-3.5 h-3.5 text-ops-amber" />
          <h2 className="text-[11px] font-bold tracking-widest text-ops-amber glow-text-amber">AIRSPACE CONTROL</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <Crosshair className="w-3 h-3 text-primary pulse-dot" />
          <span className="text-[10px] text-muted-foreground">{sweep}° SWEEP</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {mockAirspace.map((entry, i) => {
          const style = statusStyles[entry.status];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-2 rounded border border-border bg-secondary/30 hover:border-primary/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-foreground tracking-wider">{entry.zone}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span className={`text-[9px] font-bold tracking-wider uppercase ${style.text}`}>{entry.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">{entry.type}</span>
                <span className="text-[10px] text-primary font-bold">{entry.detections} tracks</span>
              </div>
              {entry.notam && (
                <p className="text-[8px] text-ops-amber mt-1.5 border-t border-border pt-1">
                  {entry.notam}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="px-3 py-1.5 border-t border-border">
        <p className="text-[8px] text-muted-foreground text-center tracking-wider">
          SOURCE: FAA NOTAM · EUROCONTROL · ICAO
        </p>
      </div>
    </div>
  );
}
