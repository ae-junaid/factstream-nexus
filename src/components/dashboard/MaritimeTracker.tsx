import { motion } from 'framer-motion';
import { Anchor, AlertTriangle, Navigation } from 'lucide-react';

interface VesselData {
  id: string;
  name: string;
  type: string;
  flag: string;
  status: 'underway' | 'anchored' | 'blocked' | 'diverted';
  position: string;
  heading: string;
  speed: string;
  note?: string;
}

const mockVessels: VesselData[] = [
  { id: 'v1', name: 'MSC ANNA', type: 'Container Ship', flag: '🇱🇷', status: 'diverted', position: 'Bab el-Mandeb Strait', heading: 'NW', speed: '14.2 kts', note: 'Diverted from Red Sea — Houthi threat' },
  { id: 'v2', name: 'USS EISENHOWER', type: 'Aircraft Carrier (CVN-69)', flag: '🇺🇸', status: 'underway', position: 'Eastern Mediterranean', heading: 'E', speed: '18.5 kts' },
  { id: 'v3', name: 'EVER GIVEN', type: 'Container Ship', flag: '🇵🇦', status: 'anchored', position: 'Port Said, Egypt', heading: '--', speed: '0 kts', note: 'Holding — Suez transit delayed' },
  { id: 'v4', name: 'INS KOLKATA', type: 'Destroyer (D63)', flag: '🇮🇳', status: 'underway', position: 'Gulf of Aden', heading: 'W', speed: '22.1 kts', note: 'Anti-piracy patrol' },
  { id: 'v5', name: 'STENA IMPERO', type: 'Tanker', flag: '🇬🇧', status: 'blocked', position: 'Strait of Hormuz', heading: '--', speed: '0 kts', note: 'IRGC interdiction warning zone' },
  { id: 'v6', name: 'JS IZUMO', type: 'Helicopter Carrier (DDH-183)', flag: '🇯🇵', status: 'underway', position: 'Arabian Sea', heading: 'NW', speed: '16.8 kts' },
];

const statusStyles: Record<string, { text: string; bg: string }> = {
  underway: { text: 'text-ops-green', bg: 'bg-ops-green/10 border-ops-green/30' },
  anchored: { text: 'text-ops-amber', bg: 'bg-ops-amber/10 border-ops-amber/30' },
  blocked: { text: 'text-ops-red', bg: 'bg-ops-red/10 border-ops-red/30' },
  diverted: { text: 'text-ops-red', bg: 'bg-ops-red/10 border-ops-red/30' },
};

export default function MaritimeTracker() {
  const blockedCount = mockVessels.filter(v => v.status === 'blocked' || v.status === 'diverted').length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Anchor className="w-3.5 h-3.5 text-ops-blue" />
          <h2 className="text-[11px] font-bold tracking-widest text-ops-blue">MARITIME AIS</h2>
        </div>
        <div className="flex items-center gap-2">
          {blockedCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-ops-red">
              <AlertTriangle className="w-3 h-3" />
              {blockedCount} DISRUPTED
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {mockVessels.map((vessel, i) => {
          const style = statusStyles[vessel.status];
          return (
            <motion.div
              key={vessel.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`p-2 rounded border ${style.bg} hover:brightness-125 transition-all cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{vessel.flag}</span>
                  <span className="text-[10px] font-bold text-foreground tracking-wider">{vessel.name}</span>
                </div>
                <span className={`text-[9px] font-bold tracking-wider uppercase ${style.text}`}>{vessel.status}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{vessel.type}</p>
              <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Navigation className="w-2.5 h-2.5" />
                  {vessel.heading}
                </span>
                <span>{vessel.speed}</span>
              </div>
              <p className="text-[9px] text-foreground/70 mt-0.5">{vessel.position}</p>
              {vessel.note && (
                <p className="text-[9px] text-ops-amber mt-1 italic">⚠ {vessel.note}</p>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="px-3 py-1.5 border-t border-border">
        <p className="text-[8px] text-muted-foreground text-center tracking-wider">
          SOURCE: MARINETRAFFIC · VESSELFINDER · AIS DATA
        </p>
      </div>
    </div>
  );
}
