import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, ExternalLink } from 'lucide-react';
import { NewsItem, CREDIBILITY_CONFIG } from '@/data/mockData';

const credBgMap: Record<string, string> = {
  verified: 'bg-ops-green/20 text-ops-green border-ops-green/30',
  reliable: 'bg-ops-cyan/20 text-ops-cyan border-ops-cyan/30',
  unconfirmed: 'bg-ops-amber/20 text-ops-amber border-ops-amber/30',
  disputed: 'bg-ops-red/20 text-ops-red border-ops-red/30',
};

// News thumbnails from unsplash based on keywords
const conflictImages = [
  'https://images.unsplash.com/photo-1590081543655-f3c3c1a56d73?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1580130379624-3a069adbffc5?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=600&h=340&fit=crop',
];

interface MediaCarouselProps {
  news: NewsItem[];
}

export default function MediaCarousel({ news = [] }: MediaCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hovering, setHovering] = useState(false);

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
  const bgImage = conflictImages[current % conflictImages.length];

  return (
    <div
      className="relative w-full h-full bg-card/50 overflow-hidden group"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-background/90 to-transparent">
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

      {/* Background image */}
      <img
        src={bgImage}
        alt=""
        className="w-full h-full object-cover transition-opacity duration-500"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-3 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${credBgMap[item.credibility]}`}>
            {cred.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {item.source}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[11px] text-foreground/90 leading-tight line-clamp-2 hover:text-primary transition-colors"
        >
          {item.headline}
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
