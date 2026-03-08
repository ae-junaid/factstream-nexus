import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Info, Users, MapPin, Swords, Calendar, AlertTriangle } from 'lucide-react';
import { ConflictZone } from '@/lib/conflicts';
import { ConflictEvent, NewsItem } from '@/data/mockData';

interface ConflictOverviewProps {
  conflict: ConflictZone;
  events: ConflictEvent[];
  news: NewsItem[];
}

const CONFLICT_CONTEXT: Record<string, {
  started: string;
  summary: string;
  displaced: string;
  casualties: string;
  keyFact: string;
}> = {
  'iran-israel': {
    started: 'Oct 2023',
    summary: 'Multi-front conflict involving Israel, Hamas in Gaza, Hezbollah in Lebanon, Iran-backed proxies, and Houthi attacks on Red Sea shipping. Ongoing ground operations in Gaza with massive humanitarian crisis.',
    displaced: '2.3M+',
    casualties: '45,000+',
    keyFact: 'Over 70% of Gaza infrastructure destroyed',
  },
  'ukraine-russia': {
    started: 'Feb 2022',
    summary: 'Full-scale Russian invasion of Ukraine. Active front lines across eastern and southern Ukraine with ongoing drone and missile strikes on civilian infrastructure. Western military aid continues.',
    displaced: '6.2M+',
    casualties: '500,000+ (est.)',
    keyFact: 'Largest European conflict since WWII',
  },
  'yemen-red-sea': {
    started: '2014 / 2023 escalation',
    summary: 'Houthi forces in Yemen launch anti-ship missiles and drones at commercial vessels in the Red Sea and Gulf of Aden, disrupting global shipping. US and UK conduct retaliatory strikes.',
    displaced: '4.5M+',
    casualties: '150,000+',
    keyFact: '12% of global trade transits the Red Sea',
  },
  'sudan': {
    started: 'Apr 2023',
    summary: 'Civil war between the Sudanese Armed Forces (SAF) and the paramilitary Rapid Support Forces (RSF). Widespread atrocities in Darfur. One of the world\'s worst humanitarian crises.',
    displaced: '10.7M+',
    casualties: '15,000+',
    keyFact: 'World\'s largest displacement crisis',
  },
  'myanmar': {
    started: 'Feb 2021',
    summary: 'Following a military coup, armed resistance groups and ethnic armed organizations fight the junta across the country. Resistance forces have made significant territorial gains in 2024-2025.',
    displaced: '2.7M+',
    casualties: '6,000+',
    keyFact: 'Junta has lost control of ~60% of territory',
  },
};

export default function ConflictOverview({ conflict, events, news }: ConflictOverviewProps) {
  const context = CONFLICT_CONTEXT[conflict.id] || {
    started: 'Unknown',
    summary: 'Conflict monitoring active.',
    displaced: 'N/A',
    casualties: 'N/A',
    keyFact: 'Data collection in progress',
  };

  const stats = useMemo(() => {
    const recentEvents = events.length;
    const sources = new Set(news.map(n => n.source)).size;
    const parties = conflict.parties.join(' vs ');
    return { recentEvents, sources, parties };
  }, [events, news, conflict.parties]);

  const infoCards = [
    { icon: Calendar, label: 'STARTED', value: context.started },
    { icon: Users, label: 'DISPLACED', value: context.displaced },
    { icon: AlertTriangle, label: 'CASUALTIES', value: context.casualties },
    { icon: MapPin, label: 'EVENTS NOW', value: String(stats.recentEvents) },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-primary" />
          <h2 className="text-[11px] font-bold tracking-widest text-primary glow-text-cyan">
            CONFLICT OVERVIEW
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <Swords className="w-3 h-3 text-ops-amber" />
          <span className="text-[10px] text-muted-foreground">{conflict.shortLabel}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Parties */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 flex-wrap"
        >
          {conflict.parties.map(party => (
            <span
              key={party}
              className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border border-border bg-secondary/50 text-foreground"
            >
              {party}
            </span>
          ))}
        </motion.div>

        {/* Summary */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-[10px] text-muted-foreground leading-relaxed"
        >
          {context.summary}
        </motion.p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {infoCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 + i * 0.03 }}
              className="p-2 rounded border border-border bg-secondary/30"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <card.icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[8px] text-muted-foreground tracking-widest">{card.label}</span>
              </div>
              <span className="text-sm font-bold text-foreground">{card.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Key fact */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-2 rounded border border-ops-amber/30 bg-ops-amber/5"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3 h-3 text-ops-amber shrink-0 mt-0.5" />
            <div>
              <span className="text-[8px] text-ops-amber tracking-widest font-bold">KEY FACT</span>
              <p className="text-[10px] text-foreground/80 mt-0.5">{context.keyFact}</p>
            </div>
          </div>
        </motion.div>

        {/* Regions monitored */}
        <div>
          <span className="text-[8px] text-muted-foreground tracking-widest">REGIONS MONITORED</span>
          <div className="flex items-center gap-1 flex-wrap mt-1">
            {conflict.regions.map(r => (
              <span key={r} className="text-[8px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/50 border border-border">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Live sources */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-[8px] text-muted-foreground tracking-wider">
            {stats.sources} LIVE SOURCES
          </span>
          <span className="text-[8px] text-muted-foreground tracking-wider">
            DATA: GDELT · ACLED · OCHA
          </span>
        </div>
      </div>
    </div>
  );
}
