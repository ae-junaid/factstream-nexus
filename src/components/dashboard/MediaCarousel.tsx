import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [hovering, setHovering] = useState(false);
  const items = (news || []).slice(0, 15);

  const next = useCallback(() => {
    if (items.length === 0) return;
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    if (items.length === 0) return;
    setCurrent((c) => (c - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0 || hovering) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, items.length, hovering]);

  useEffect(() => {
    setCurrent(0);
  }, [news]);

  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-card/50">
        <div className="text-center space-y-1">
          <div className="inline-block w-1.5 h-1.5 rounded-full bg-ops-amber pulse-dot" />
          <p className="text-[10px] text-muted-foreground tracking-wider">AWAITING UPDATES...</p>
        </div>
      </div>
    );
  }

  const safeIndex = current < items.length ? current : 0;
  const item = items[safeIndex];
  if (!item) return null;
  const { title, source: parsedSource } = cleanHeadline(item.headline);
  const displaySource = parsedSource || item.source;
  const cred = CREDIBILITY_CONFIG[item.credibility];

  // Get next 2 items for preview
  const upcoming = [1, 2].map(offset => {
    const idx = (safeIndex + offset) % items.length;
    const n = items[idx];
    if (!n) return null;
    const { title: t, source: s } = cleanHeadline(n.headline);
    return { title: t, source: s || n.source, time: timeAgo(n.timestamp) };
  }).filter(Boolean);

  return (
    <div
      className="h-full flex flex-col bg-card/60 group relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Header bar */}
      <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border-b border-border bg-background/80">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-ops-red pulse-dot" />
          <span className="text-[10px] font-bold tracking-widest text-primary glow-text-cyan">MAJOR UPDATES</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.preventDefault(); prev(); }} className="p-0.5 rounded hover:bg-secondary/60 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <span className="text-[9px] text-muted-foreground font-mono">{safeIndex + 1}/{items.length}</span>
          <button onClick={(e) => { e.preventDefault(); next(); }} className="p-0.5 rounded hover:bg-secondary/60 transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main article card */}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex flex-col justify-center px-4 py-3 hover:bg-secondary/30 transition-all min-h-0"
      >
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${credBgMap[item.credibility]}`}>
            {cred.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono uppercase truncate">
            {displaySource}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono ml-auto flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            {timeAgo(item.timestamp)}
          </span>
        </div>

        {/* Headline - prominent */}
        <h3 className="text-sm leading-snug font-bold text-foreground/95 group-hover:text-primary transition-colors mb-2">
          {title}
          <ExternalLink className="inline w-3 h-3 ml-1.5 opacity-30 group-hover:opacity-70" />
        </h3>

        {/* Progress bar */}
        <div className="flex gap-1 mt-auto">
          {items.slice(0, Math.min(items.length, 10)).map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
              className={`h-0.5 rounded-full flex-1 transition-all ${
                i === safeIndex ? 'bg-primary' : 'bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
      </a>

      {/* Upcoming preview */}
      {upcoming.length > 0 && (
        <div className="shrink-0 border-t border-border bg-background/50">
          {upcoming.map((u, i) => u && (
            <div key={i} className="flex items-center gap-2 px-4 py-1.5 border-b border-border/50 last:border-b-0">
              <span className="text-[8px] text-muted-foreground font-mono shrink-0">NEXT</span>
              <p className="text-[10px] text-muted-foreground truncate flex-1">{u.title}</p>
              <span className="text-[9px] text-muted-foreground/60 font-mono shrink-0">{u.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
