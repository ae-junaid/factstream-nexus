import { HumanitarianStat } from '@/data/mockData';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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

interface StatsPanelProps {
  stats: HumanitarianStat[];
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h2 className="text-[11px] font-bold tracking-widest text-primary glow-text-cyan">HUMANITARIAN DATA</h2>
        <span className="text-[10px] text-muted-foreground">LIVE</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
        {stats.map((stat, i) => {
          const Icon = trendIcon[stat.trend];
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-2.5 rounded border border-border bg-secondary/30 hover:border-primary/20 transition-all"
            >
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-foreground">{stat.value}</span>
                <div className={`flex items-center gap-0.5 text-[10px] ${trendColor[stat.trend]}`}>
                  <Icon className="w-3 h-3" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">{stat.source}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
