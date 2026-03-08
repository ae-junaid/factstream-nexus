import { TrendingUp, TrendingDown, Minus, Activity, Loader2 } from 'lucide-react';
import { ConflictZone } from '@/lib/conflicts';
import { ConflictEvent, NewsItem } from '@/data/mockData';

interface StatsBannerProps {
  conflict: ConflictZone;
  events: ConflictEvent[];
  news: NewsItem[];
}

interface LiveStat {
  label: string;
  value: string;
  change?: string;
  trend: 'up' | 'down' | 'stable';
  source: string;
}

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const trendColor = {
  up: 'text-ops-red',
  down: 'text-ops-amber',
  stable: 'text-muted-foreground',
};

export default function StatsBanner({ conflict, events = [], news = [] }: StatsBannerProps) {
  // Derive live stats from actual fetched data
  const eventsByType = (events || []).reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const verifiedCount = events.filter(e => e.credibility === 'verified').length;
  const sourceCount = new Set(events.map(e => e.source)).size;
  const newsSourceCount = new Set(news.map(n => n.source)).size;

  const stats: LiveStat[] = [
    { label: 'Live Events', value: String(events.length), trend: 'up', source: 'GDELT' },
    { label: 'News Sources', value: String(newsSourceCount), trend: 'stable', source: 'GDELT' },
    { label: 'Verified Reports', value: String(verifiedCount), trend: 'stable', source: 'OSINT' },
    { label: 'Airstrikes', value: String(eventsByType.airstrike || 0), trend: eventsByType.airstrike ? 'up' : 'stable', source: 'GDELT' },
    { label: 'Rocket/Missile', value: String(eventsByType.rocket_attack || 0), trend: eventsByType.rocket_attack ? 'up' : 'stable', source: 'GDELT' },
    { label: 'Ground Ops', value: String(eventsByType.ground_operation || 0), trend: eventsByType.ground_operation ? 'up' : 'stable', source: 'GDELT' },
    { label: 'Diplomatic', value: String(eventsByType.diplomatic || 0), trend: 'stable', source: 'GDELT' },
    { label: 'Humanitarian', value: String(eventsByType.humanitarian || 0), trend: eventsByType.humanitarian ? 'up' : 'stable', source: 'GDELT' },
    { label: 'Naval Events', value: String(eventsByType.naval || 0), trend: 'stable', source: 'GDELT' },
    { label: 'Active Regions', value: String(conflict.regions.length), trend: 'stable', source: 'CONFIG' },
    { label: 'Intel Sources', value: String(sourceCount), trend: 'stable', source: 'OSINT' },
    { label: 'Conflict Zone', value: conflict.shortLabel, trend: 'stable', source: 'ACTIVE' },
  ];

  return (
    <div className="w-full border-b border-border bg-card/50">
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-secondary/50 border-r border-border">
          <Activity className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-bold tracking-widest text-primary glow-text-cyan">SITREP</span>
        </div>
        <div className="flex-1 flex items-center gap-0 overflow-hidden">
          {events.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-2">
              <Loader2 className="w-3 h-3 text-primary animate-spin" />
              <span className="text-[10px] text-muted-foreground tracking-wider">AGGREGATING INTELLIGENCE...</span>
            </div>
          ) : (
            stats.map((stat) => {
              const Icon = trendIcon[stat.trend];
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-2.5 px-4 py-2 border-r border-border last:border-r-0 shrink-0"
                >
                  <div>
                    <p className="text-[8px] text-muted-foreground tracking-wider uppercase leading-none">{stat.label}</p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-sm font-bold text-foreground leading-none">{stat.value}</span>
                      <div className={`flex items-center gap-0.5 text-[9px] ${trendColor[stat.trend]}`}>
                        <Icon className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[7px] text-muted-foreground/60 hidden sm:inline">{stat.source}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
