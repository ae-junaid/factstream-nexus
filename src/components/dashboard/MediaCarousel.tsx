import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, ExternalLink, Newspaper } from 'lucide-react';
import { NewsItem, CREDIBILITY_CONFIG } from '@/data/mockData';

const credBgMap: Record<string, string> = {
  verified: 'bg-ops-green/20 text-ops-green border-ops-green/30',
  reliable: 'bg-ops-cyan/20 text-ops-cyan border-ops-cyan/30',
  unconfirmed: 'bg-ops-amber/20 text-ops-amber border-ops-amber/30',
  disputed: 'bg-ops-red/20 text-ops-red border-ops-red/30',
};

// Source-based gradient backgrounds when no image available
const SOURCE_GRADIENTS: Record<string, string> = {
  'reuters.com': 'from-orange-900/80 to-orange-950/90',
  'apnews.com': 'from-red-900/80 to-red-950/90',
  'bbc.com': 'from-red-800/80 to-zinc-900/90',
  'bbc.co.uk': 'from-red-800/80 to-zinc-900/90',
  'aljazeera.com': 'from-amber-900/80 to-amber-950/90',
  'theguardian.com': 'from-blue-900/80 to-blue-950/90',
  'cnn.com': 'from-red-900/80 to-red-950/90',
  'nytimes.com': 'from-neutral-800/80 to-neutral-950/90',
  'france24.com': 'from-blue-800/80 to-blue-950/90',
  'timesofisrael.com': 'from-blue-900/80 to-blue-950/90',
};

function getGradient(source: string): string {
  const s = source.toLowerCase();
  for (const [domain, gradient] of Object.entries(SOURCE_GRADIENTS)) {
    if (s.includes(domain)) return gradient;
  }
  return 'from-slate-800/80 to-slate-950/90';
}

interface MediaCarouselProps {
  news: NewsItem[];
}

export default function MediaCarousel({ news = [] }: MediaCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const items = (news || []).slice(0, 10);
  const paused = locked || hovering;

  const next = useCallback(() => {
    if (items.length === 0) return;
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    if (items.length === 0) return;
    setCurrent((c) => (c - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (paused || items.length === 0) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next, items.length]);

  useEffect(() => {
    setCurrent(0);
    setFailedImages(new Set());
  }, [news]);

  if (items.length === 0) {
    return (
      <div className="w-full h-full bg-card/50 flex items-center justify-center">
        <span className="text-[10px] text-muted-foreground tracking-wider">LOADING MEDIA FEED...</span>
      </div>
    );
  }

  const item = items[current];
  const cred = CREDIBILITY_CONFIG[item.credibility];
  const hasImage = item.imageUrl && !failedImages.has(current);

  const titleParts = item.headline.split(' - ');
  const realSource = titleParts.length > 1 ? titleParts[titleParts.length - 1].trim() : item.source;
  const cleanHeadline = titleParts.length > 1 ? titleParts.slice(0, -1).join(' - ') : item.headline;

  return (
    <div
      className="relative w-full h-full bg-background overflow-hidden group"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-1.5 bg-background/95 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-ops-red pulse-dot" />
          <span className="text-[10px] font-bold tracking-widest text-primary glow-text-cyan">
            LIVE NEWS FEED
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocked((l) => !l)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-background/60 hover:bg-secondary/80 transition-colors"
            title={locked ? 'Resume auto-slide' : 'Pause auto-slide'}
          >
            {locked ? <Play className="w-3 h-3 text-ops-green" /> : <Pause className="w-3 h-3 text-ops-amber" />}
            <span className="text-[8px] font-bold tracking-wider text-muted-foreground">
              {locked ? 'PLAY' : 'PAUSE'}
            </span>
          </button>
          <span className="text-[9px] text-muted-foreground font-mono">
            {current + 1}/{items.length}
          </span>
        </div>
      </div>

      {/* Background: image or gradient fallback */}
      {hasImage ? (
        <img
          src={item.imageUrl}
          alt={cleanHeadline}
          className="w-full h-full object-cover"
          onError={() => setFailedImages(prev => new Set(prev).add(current))}
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${getGradient(item.source)} flex items-center justify-center`}>
          <div className="text-center opacity-30">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              {realSource}
            </span>
          </div>
        </div>
      )}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-3 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${credBgMap[item.credibility]}`}>
            {cred.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {realSource}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[11px] text-foreground/90 leading-tight line-clamp-2 hover:text-primary transition-colors font-medium"
        >
          {cleanHeadline}
          <ExternalLink className="inline w-3 h-3 ml-1 opacity-50" />
        </a>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-1 rounded bg-background/50 text-foreground/70 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 p-1 rounded bg-background/50 text-foreground/70 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center gap-1 pb-1">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === current ? 'bg-primary w-3' : 'bg-muted-foreground/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
