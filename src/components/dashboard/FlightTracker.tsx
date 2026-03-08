import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plane, AlertTriangle, Radio } from 'lucide-react';

interface FlightData {
  id: string;
  callsign: string;
  type: string;
  altitude: string;
  speed: string;
  heading: string;
  origin: string;
  status: 'active' | 'alert' | 'grounded';
  category: 'military' | 'surveillance' | 'cargo' | 'tanker';
}

const mockFlights: FlightData[] = [
  { id: 'f1', callsign: 'FORTE12', type: 'RQ-4B Global Hawk', altitude: 'FL550', speed: '310 kts', heading: 'SE', origin: 'Sigonella, Italy', status: 'active', category: 'surveillance' },
  { id: 'f2', callsign: 'HOMER71', type: 'RC-135W Rivet Joint', altitude: 'FL340', speed: '420 kts', heading: 'E', origin: 'RAF Mildenhall', status: 'active', category: 'surveillance' },
  { id: 'f3', callsign: 'LAGR223', type: 'KC-135R Stratotanker', altitude: 'FL280', speed: '380 kts', heading: 'SE', origin: 'RAF Fairford', status: 'active', category: 'tanker' },
  { id: 'f4', callsign: 'RCH4501', type: 'C-17A Globemaster', altitude: 'FL310', speed: '450 kts', heading: 'E', origin: 'Ramstein, Germany', status: 'active', category: 'cargo' },
  { id: 'f5', callsign: 'DUKE01', type: 'F-15E Strike Eagle', altitude: 'FL250', speed: '520 kts', heading: 'S', origin: 'RAF Lakenheath', status: 'alert', category: 'military' },
  { id: 'f6', callsign: 'VIPER22', type: 'F-16C Fighting Falcon', altitude: 'FL220', speed: '490 kts', heading: 'SE', origin: 'Incirlik, Turkey', status: 'active', category: 'military' },
];

const categoryColors: Record<string, string> = {
  military: 'text-ops-red',
  surveillance: 'text-ops-cyan',
  cargo: 'text-ops-green',
  tanker: 'text-ops-amber',
};

const categoryBg: Record<string, string> = {
  military: 'bg-ops-red/10 border-ops-red/30',
  surveillance: 'bg-ops-cyan/10 border-ops-cyan/30',
  cargo: 'bg-ops-green/10 border-ops-green/30',
  tanker: 'bg-ops-amber/10 border-ops-amber/30',
};

export default function FlightTracker() {
  const [activePings, setActivePings] = useState(mockFlights.length);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePings(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Plane className="w-3.5 h-3.5 text-primary" />
          <h2 className="text-[11px] font-bold tracking-widest text-primary glow-text-cyan">ADS-B TRACKER</h2>
        </div>
        <div className="flex items-center gap-2">
          <Radio className="w-3 h-3 text-ops-green pulse-dot" />
          <span className="text-[10px] text-ops-green">{activePings} ACTIVE</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {mockFlights.map((flight, i) => (
          <motion.div
            key={flight.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`p-2 rounded border ${categoryBg[flight.category]} hover:brightness-125 transition-all cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold tracking-wider ${categoryColors[flight.category]}`}>
                  {flight.callsign}
                </span>
                {flight.status === 'alert' && <AlertTriangle className="w-3 h-3 text-ops-red pulse-dot" />}
              </div>
              <span className="text-[9px] text-muted-foreground uppercase">{flight.category}</span>
            </div>
            <p className="text-[10px] text-foreground mt-1">{flight.type}</p>
            <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
              <span>{flight.altitude}</span>
              <span>{flight.speed}</span>
              <span>HDG {flight.heading}</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">{flight.origin}</p>
          </motion.div>
        ))}
      </div>
      <div className="px-3 py-1.5 border-t border-border">
        <p className="text-[8px] text-muted-foreground text-center tracking-wider">
          SOURCE: ADS-B EXCHANGE · OPENSKY NETWORK · FLIGHTRADAR24
        </p>
      </div>
    </div>
  );
}
