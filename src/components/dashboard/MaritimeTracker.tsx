import { motion } from 'framer-motion';
import { Anchor, AlertTriangle, Navigation } from 'lucide-react';
import { ConflictZone } from '@/lib/conflicts';

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

const VESSELS_BY_CONFLICT: Record<string, VesselData[]> = {
  'iran-israel': [
    { id: 'v-ii-1', name: 'USS EISENHOWER', type: 'Aircraft Carrier CVN-69', flag: '🇺🇸', status: 'underway', position: 'Eastern Mediterranean', heading: 'E', speed: '18.5 kts' },
    { id: 'v-ii-2', name: 'MSC ANNA', type: 'Container Ship', flag: '🇱🇷', status: 'diverted', position: 'Bab el-Mandeb Strait', heading: 'NW', speed: '14.2 kts', note: 'Diverted — Houthi threat' },
    { id: 'v-ii-3', name: 'INS KOLKATA', type: 'Destroyer D63', flag: '🇮🇳', status: 'underway', position: 'Gulf of Aden', heading: 'W', speed: '22.1 kts', note: 'Anti-piracy patrol' },
    { id: 'v-ii-4', name: 'STENA IMPERO', type: 'Oil Tanker', flag: '🇬🇧', status: 'blocked', position: 'Strait of Hormuz', heading: '--', speed: '0 kts', note: 'IRGC interdiction zone' },
    { id: 'v-ii-5', name: 'EVER GIVEN', type: 'Container Ship', flag: '🇵🇦', status: 'anchored', position: 'Port Said, Egypt', heading: '--', speed: '0 kts', note: 'Suez transit delayed' },
    { id: 'v-ii-6', name: 'JS IZUMO', type: 'Helicopter Carrier DDH-183', flag: '🇯🇵', status: 'underway', position: 'Arabian Sea', heading: 'NW', speed: '16.8 kts' },
  ],
  'ukraine-russia': [
    { id: 'v-ur-1', name: 'MOSKVA II', type: 'Guided Missile Cruiser', flag: '🇷🇺', status: 'underway', position: 'Black Sea, off Sevastopol', heading: 'S', speed: '12 kts', note: 'Black Sea Fleet flagship' },
    { id: 'v-ur-2', name: 'TCG ANADOLU', type: 'Amphibious Assault Ship', flag: '🇹🇷', status: 'underway', position: 'Bosphorus Strait', heading: 'NE', speed: '14 kts', note: 'Turkish Navy patrol' },
    { id: 'v-ur-3', name: 'USS ROSS', type: 'Destroyer DDG-71', flag: '🇺🇸', status: 'underway', position: 'Western Black Sea', heading: 'W', speed: '20 kts', note: 'NATO freedom of navigation' },
    { id: 'v-ur-4', name: 'NORD STREAM SURVEY', type: 'Survey Vessel', flag: '🇳🇴', status: 'underway', position: 'Baltic Sea', heading: 'E', speed: '4 kts', note: 'Pipeline inspection' },
    { id: 'v-ur-5', name: 'GRAIN CARRIER ODESSA', type: 'Bulk Carrier', flag: '🇺🇦', status: 'anchored', position: 'Odessa Port', heading: '--', speed: '0 kts', note: 'Awaiting grain corridor clearance' },
  ],
  'yemen-red-sea': [
    { id: 'v-yr-1', name: 'USS CARNEY', type: 'Destroyer DDG-64', flag: '🇺🇸', status: 'underway', position: 'Southern Red Sea', heading: 'S', speed: '22 kts', note: 'Houthi intercept ops' },
    { id: 'v-yr-2', name: 'GALAXY LEADER', type: 'Cargo Ship', flag: '🇧🇭', status: 'blocked', position: 'Hodeidah Port, Yemen', heading: '--', speed: '0 kts', note: 'Seized by Houthis' },
    { id: 'v-yr-3', name: 'HMS DIAMOND', type: 'Destroyer D34', flag: '🇬🇧', status: 'underway', position: 'Bab el-Mandeb', heading: 'E', speed: '18 kts', note: 'Op Prosperity Guardian' },
    { id: 'v-yr-4', name: 'MAERSK HANGZHOU', type: 'Container Ship', flag: '🇩🇰', status: 'diverted', position: 'Gulf of Aden', heading: 'NW', speed: '16 kts', note: 'Rerouted via Cape' },
    { id: 'v-yr-5', name: 'FS ALSACE', type: 'Frigate D656', flag: '🇫🇷', status: 'underway', position: 'Southern Red Sea', heading: 'N', speed: '20 kts', note: 'EU NAVFOR escort' },
  ],
  'sudan': [
    { id: 'v-sd-1', name: 'DIGNITY', type: 'Aid Ship', flag: '🇺🇳', status: 'underway', position: 'Red Sea, off Port Sudan', heading: 'W', speed: '10 kts', note: 'UNHCR humanitarian aid' },
    { id: 'v-sd-2', name: 'PORT SUDAN CARGO', type: 'Bulk Carrier', flag: '🇪🇬', status: 'anchored', position: 'Port Sudan anchorage', heading: '--', speed: '0 kts', note: 'Awaiting port clearance' },
    { id: 'v-sd-3', name: 'WFP HOPE', type: 'Supply Vessel', flag: '🇺🇳', status: 'underway', position: 'Red Sea approach', heading: 'SW', speed: '12 kts', note: 'Emergency food delivery' },
  ],
  'myanmar': [
    { id: 'v-mm-1', name: 'UMS KYAN SITTHA', type: 'Frigate', flag: '🇲🇲', status: 'underway', position: 'Andaman Sea', heading: 'S', speed: '12 kts', note: 'Myanmar Navy patrol' },
    { id: 'v-mm-2', name: 'INS SAHYADRI', type: 'Frigate F49', flag: '🇮🇳', status: 'underway', position: 'Bay of Bengal', heading: 'E', speed: '16 kts', note: 'Indian Navy patrol' },
    { id: 'v-mm-3', name: 'HTMS BHUMIBOL', type: 'Frigate FFG-471', flag: '🇹🇭', status: 'underway', position: 'Andaman Sea, Thai waters', heading: 'N', speed: '14 kts', note: 'Border monitoring' },
  ],
};

const statusStyles: Record<string, { text: string; bg: string }> = {
  underway: { text: 'text-ops-green', bg: 'bg-ops-green/10 border-ops-green/30' },
  anchored: { text: 'text-ops-amber', bg: 'bg-ops-amber/10 border-ops-amber/30' },
  blocked: { text: 'text-ops-red', bg: 'bg-ops-red/10 border-ops-red/30' },
  diverted: { text: 'text-ops-red', bg: 'bg-ops-red/10 border-ops-red/30' },
};

interface MaritimeTrackerProps {
  conflict: ConflictZone;
}

export default function MaritimeTracker({ conflict }: MaritimeTrackerProps) {
  const vessels = VESSELS_BY_CONFLICT[conflict.id] || [];
  const blockedCount = vessels.filter(v => v.status === 'blocked' || v.status === 'diverted').length;

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
          <span className="text-[10px] text-muted-foreground">{vessels.length} vessels</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {vessels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-[10px] text-muted-foreground tracking-wider">NO VESSELS TRACKED</span>
          </div>
        ) : (
          vessels.map((vessel, i) => {
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
          })
        )}
      </div>
      <div className="px-3 py-1.5 border-t border-border">
        <p className="text-[8px] text-muted-foreground text-center tracking-wider">
          SOURCE: AIS MARITIME DATA
        </p>
      </div>
    </div>
  );
}
