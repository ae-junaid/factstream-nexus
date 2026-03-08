import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Radar, Loader2 } from 'lucide-react';
import { ConflictZone } from '@/lib/conflicts';
import { useOpenSkyFlights } from '@/hooks/useOpenSkyData';

const statusStyles: Record<string, { text: string; dot: string }> = {
  active: { text: 'text-ops-green', dot: 'bg-ops-green' },
  restricted: { text: 'text-ops-amber', dot: 'bg-ops-amber' },
  closed: { text: 'text-ops-red', dot: 'bg-ops-red' },
};

interface AirspaceMonitorProps {
  conflict: ConflictZone;
}

export default function AirspaceMonitor({ conflict }: AirspaceMonitorProps) {
  const { flights, loading, rateLimited } = useOpenSkyFlights(conflict, 30000);
  const [sweep, setSweep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSweep(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Group flights by origin country
  const countryGroups = flights.reduce((acc, f) => {
    const country = f.originCountry || 'Unknown';
    if (!acc[country]) acc[country] = { count: 0, callsigns: [] as string[] };
    acc[country].count++;
    if (f.callsign) acc[country].callsigns.push(f.callsign);
    return acc;
  }, {} as Record<string, { count: number; callsigns: string[] }>);

  const entries = Object.entries(countryGroups)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 8)
    .map(([country, data]) => {
      const isMilitary = data.callsigns.some(c =>
        /^(RCH|FORTE|HOMER|DUKE|VIPER|EVIL|RAGE|TOPCAT|NCHO|LAGR)/i.test(c)
      );
      return {
        id: country,
        zone: `${country} Aircraft`,
        type: isMilitary ? 'Military/Gov Traffic' : 'Civil & Commercial',
        detections: data.count,
        status: (isMilitary ? 'restricted' : 'active') as 'active' | 'restricted' | 'closed',
        callsigns: data.callsigns.slice(0, 3).join(', '),
      };
    });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Radar className="w-3.5 h-3.5 text-ops-amber" />
          <h2 className="text-[11px] font-bold tracking-widest text-ops-amber glow-text-amber">AIRSPACE MONITOR</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <Crosshair className="w-3 h-3 text-primary pulse-dot" />
          <span className="text-[10px] text-muted-foreground">{flights.length} tracks</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {loading && entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-[10px] text-muted-foreground tracking-wider">
              {rateLimited ? 'RATE LIMITED — RETRYING...' : 'SCANNING AIRSPACE...'}
            </span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-[10px] text-muted-foreground tracking-wider">NO AIRCRAFT DETECTED</span>
          </div>
        ) : (
          entries.map((entry, i) => {
            const style = statusStyles[entry.status];
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
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
                {entry.callsigns && (
                  <p className="text-[8px] text-muted-foreground/70 mt-1 truncate">
                    {entry.callsigns}
                  </p>
                )}
              </motion.div>
            );
          })
        )}
      </div>
      <div className="px-3 py-1.5 border-t border-border">
        <p className="text-[8px] text-muted-foreground text-center tracking-wider">
          SOURCE: ADSB.LOL · LIVE ADS-B
        </p>
      </div>
    </div>
  );
}
