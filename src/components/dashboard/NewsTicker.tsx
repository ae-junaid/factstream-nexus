import { NewsItem, CREDIBILITY_CONFIG } from '@/data/mockData';
import { Loader2 } from 'lucide-react';

const credColorMap: Record<string, string> = {
  'ops-green': 'text-ops-green',
  'ops-cyan': 'text-ops-cyan',
  'ops-amber': 'text-ops-amber',
  'ops-red': 'text-ops-red',
};

interface NewsTickerProps {
  news: NewsItem[];
  loading?: boolean;
}

export default function NewsTicker({ news, loading }: NewsTickerProps) {
  const items = news.length > 0 ? news : [];
  const doubled = [...items, ...items];

  return (
    <div className="w-full border-y border-border bg-secondary/30 overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-primary/10 border-r border-border">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-ops-red pulse-dot" />
          <span className="text-[10px] font-bold tracking-widest text-primary glow-text-cyan">BREAKING</span>
        </div>
        <div className="overflow-hidden flex-1">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-1.5">
              <Loader2 className="w-3 h-3 text-primary animate-spin" />
              <span className="text-[10px] text-muted-foreground tracking-wider">FETCHING LIVE HEADLINES...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-1.5">
              <span className="text-[10px] text-muted-foreground tracking-wider">NO HEADLINES AVAILABLE</span>
            </div>
          ) : (
            <div className="ticker-animate whitespace-nowrap flex items-center py-1.5">
              {doubled.map((item, i) => {
                const cred = CREDIBILITY_CONFIG[item.credibility];
                return (
                  <a
                    key={`${item.id}-${i}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mx-6 text-xs hover:text-primary transition-colors"
                  >
                    <span className={`text-[9px] tracking-wider font-bold ${credColorMap[cred.color]}`}>
                      [{cred.label}]
                    </span>
                    <span className="text-foreground">{item.headline}</span>
                    <span className="text-muted-foreground text-[10px]">— {item.source}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
