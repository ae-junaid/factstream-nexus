import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { NewsItem, CREDIBILITY_CONFIG } from '@/data/mockData';

const credBgMap: Record<string, string> = {
  verified: 'bg-ops-green/20 text-ops-green border-ops-green/30',
  reliable: 'bg-ops-cyan/20 text-ops-cyan border-ops-cyan/30',
  unconfirmed: 'bg-ops-amber/20 text-ops-amber border-ops-amber/30',
  disputed: 'bg-ops-red/20 text-ops-red border-ops-red/30',
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'JUST NOW';
  if (mins < 60) return `${mins}m AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h AGO`;
  return `${Math.floor(hrs / 24)}d AGO`;
}

function cleanHeadline(headline: string): { title: string; source: string | null } {
  const parts = headline.split(' - ');
  if (parts.length > 1) {
    return { title: parts.slice(0, -1).join(' - '), source: parts[parts.length - 1].trim() };
  }
  return { title: headline, source: null };
}

interface MediaCarouselProps {
  news: NewsItem[];
}

export default function MediaCarousel({ news = [] }: MediaCarouselProps) {
  const [current, setCurrent] = useState(0);
  const items = (news || []).slice(0, 15);

  const next = useCallback(() => {
    if (items.length === 0) return;
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  // Auto-swap every 6 seconds
  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, items.length]);

  // Reset on new data
  useEffect(() => {
    setCurrent(0);
  }, [news]);

  if (items.length === 0) {
    return (
      <div className="px-3 py-2 bg-card/50">
        <span className="text-[10px] text-muted-foreground tracking-wider">AWAITING UPDATES...</span>
      </div>
    );
  }

  const item = items[current];
  const { title, source: parsedSource } = cleanHeadline(item.headline);
  const displaySource = parsedSource || item.source;
  const cred = CREDIBILITY_CONFIG[item.credibility];

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 px-3 py-2 bg-card/60 hover:bg-secondary/40 transition-all group"
    >
      {/* Left: label + counter */}
      <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-ops-red pulse-dot" />
        <span className="text-[8px] font-bold tracking-widest text-primary glow-text-cyan writing-vertical">
          UPDATE
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[7px] font-bold tracking-wider px-1 py-0.5 rounded border ${credBgMap[item.credibility]}`}>
            {cred.label}
          </span>
          <span className="text-[9px] text-muted-foreground font-mono uppercase truncate">
            {displaySource}
          </span>
          <span className="text-[9px] text-muted-foreground font-mono ml-auto flex items-center gap-0.5 shrink-0">
            <Clock className="w-2.5 h-2.5" />
            {timeAgo(item.timestamp)}
          </span>
        </div>
        <p className="text-[11px] leading-snug font-semibold text-foreground/90 group-hover:text-primary transition-colors line-clamp-1">
          {title}
          <ExternalLink className="inline w-2.5 h-2.5 ml-1 opacity-30 group-hover:opacity-70" />
        </p>
      </div>

      {/* Counter */}
      <div className="shrink-0 self-center">
        <span className="text-[9px] text-muted-foreground font-mono">{current + 1}/{items.length}</span>
      </div>
    </a>
  );
}
