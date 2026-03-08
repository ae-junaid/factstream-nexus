import { motion } from 'framer-motion';
import { ShieldAlert, ChevronUp } from 'lucide-react';

interface ThreatZone {
  id: string;
  region: string;
  level: 'critical' | 'high' | 'elevated' | 'moderate';
  description: string;
  lastEscalation: string;
}

const mockThreats: ThreatZone[] = [
  { id: 't1', region: 'Gaza Strip', level: 'critical', description: 'Active ground & air operations', lastEscalation: '12m ago' },
  { id: 't2', region: 'Southern Lebanon', level: 'high', description: 'Cross-border exchanges ongoing', lastEscalation: '2h ago' },
  { id: 't3', region: 'Red Sea / Bab el-Mandeb', level: 'high', description: 'Houthi anti-ship operations', lastEscalation: '5h ago' },
  { id: 't4', region: 'Strait of Hormuz', level: 'elevated', description: 'IRGC naval activity increased', lastEscalation: '8h ago' },
  { id: 't5', region: 'West Bank', level: 'elevated', description: 'IDF raids in Jenin, Tulkarm', lastEscalation: '6h ago' },
  { id: 't6', region: 'Syria-Iraq Border', level: 'moderate', description: 'Militia repositioning reported', lastEscalation: '14h ago' },
];

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

export default function ThreatAssessment() {
  const criticalCount = mockThreats.filter(t => t.level === 'critical' || t.level === 'high').length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-ops-red" />
          <h2 className="text-[11px] font-bold tracking-widest text-ops-red">THREAT MATRIX</h2>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-ops-red">
          <ChevronUp className="w-3 h-3" />
          <span>{criticalCount} CRITICAL</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {mockThreats.map((threat, i) => {
          const config = levelConfig[threat.level];
          return (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`p-2 rounded border ${config.bg} transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-foreground tracking-wider">{threat.region}</span>
                <span className={`text-[9px] font-bold tracking-widest uppercase ${config.color}`}>{threat.level}</span>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">{threat.description}</p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex-1 h-1 rounded-full bg-secondary mr-3">
                  <div className={`h-full rounded-full ${config.bar} ${levelWidth[threat.level]}`} />
                </div>
                <span className="text-[8px] text-muted-foreground shrink-0">{threat.lastEscalation}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
