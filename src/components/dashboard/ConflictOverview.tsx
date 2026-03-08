import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Info, Users, MapPin, Swords, Calendar, AlertTriangle, Globe, Radio } from 'lucide-react';
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
    started: 'Feb 2026',
    summary: 'Direct military confrontation between Iran and Israel erupted in late February 2026. Exchange of ballistic missiles and airstrikes targeting military and nuclear facilities. Regional escalation involving Hezbollah, Houthis, and Iran-backed militias across multiple fronts. Major disruption to global energy markets and shipping lanes.',
    displaced: '850K+',
    casualties: '12,000+ (est.)',
    keyFact: 'First direct Iran-Israel war — global energy crisis triggered',
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
    return { recentEvents, sources };
  }, [events, news]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-primary/10 border border-primary/20">
            <Globe className="w-3 h-3 text-primary" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold tracking-widest text-primary glow-text-cyan leading-none">
              SITUATION BRIEFING
            </h2>
            <span className="text-[8px] text-muted-foreground tracking-wider">{conflict.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio className="w-2.5 h-2.5 text-ops-green pulse-dot" />
          <span className="text-[9px] text-ops-green font-bold tracking-wider">LIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Parties row */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 flex-wrap"
        >
          <Swords className="w-3 h-3 text-ops-amber shrink-0" />
          {conflict.parties.map((party, i) => (
            <span key={party} className="flex items-center gap-1">
              <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-sm border border-border bg-secondary/60 text-foreground">
                {party}
              </span>
              {i < conflict.parties.length - 1 && (
                <span className="text-[8px] text-muted-foreground">vs</span>
              )}
            </span>
          ))}
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded border border-border bg-secondary/20 p-2.5"
        >
          <p className="text-[10px] text-foreground/80 leading-[1.6]">
            {context.summary}
          </p>
        </motion.div>

        {/* Stats — horizontal row */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { icon: Calendar, label: 'SINCE', value: context.started, color: 'text-primary' },
            { icon: Users, label: 'DISPLACED', value: context.displaced, color: 'text-ops-amber' },
            { icon: AlertTriangle, label: 'KILLED', value: context.casualties, color: 'text-ops-red' },
            { icon: MapPin, label: 'EVENTS', value: String(stats.recentEvents), color: 'text-ops-cyan' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.03 }}
              className="flex flex-col items-center text-center p-1.5 rounded border border-border bg-background/50"
            >
              <card.icon className={`w-3 h-3 ${card.color} mb-1`} />
              <span className="text-[12px] font-bold text-foreground leading-none">{card.value}</span>
              <span className="text-[7px] text-muted-foreground tracking-widest mt-0.5">{card.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Key fact — accent callout */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="relative rounded border border-ops-amber/30 bg-ops-amber/5 p-2.5 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-ops-amber/60 rounded-l" />
          <div className="flex items-start gap-2 pl-1">
            <AlertTriangle className="w-3.5 h-3.5 text-ops-amber shrink-0 mt-0.5" />
            <div>
              <span className="text-[8px] text-ops-amber tracking-widest font-bold">KEY INTELLIGENCE</span>
              <p className="text-[10px] text-foreground/80 mt-0.5 leading-relaxed">{context.keyFact}</p>
            </div>
          </div>
        </motion.div>

        {/* Regions + Sources footer */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div>
            <span className="text-[7px] text-muted-foreground tracking-[0.15em] uppercase">Monitored Regions</span>
            <div className="flex items-center gap-1 flex-wrap mt-1">
              {conflict.regions.map(r => (
                <span key={r} className="text-[8px] text-muted-foreground/80 px-1.5 py-0.5 rounded-sm bg-secondary/40 border border-border/50">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-muted-foreground tracking-wider">
              <span className="text-primary font-bold">{stats.sources}</span> ACTIVE SOURCES
            </span>
            <span className="text-[7px] text-muted-foreground/60 tracking-wider">
              GDELT · ACLED · OCHA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
