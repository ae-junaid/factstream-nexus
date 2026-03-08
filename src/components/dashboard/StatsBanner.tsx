import { HumanitarianStat } from '@/data/mockData';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

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

interface StatsBannerProps {
  stats: HumanitarianStat[];
}

export default function StatsBanner({ stats }: StatsBannerProps) {
  return (
    <div className="w-full border-b border-border bg-card/50">
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-secondary/50 border-r border-border">
          <Activity className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-bold tracking-widest text-primary glow-text-cyan">SITREP</span>
        </div>
        <div className="flex-1 flex items-center gap-0 overflow-hidden">
          {stats.map((stat) => {
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
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[7px] text-muted-foreground/60 hidden sm:inline">{stat.source}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
