import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { WarMedia, MediaCredibility } from '@/data/mediaData';
import { CREDIBILITY_CONFIG } from '@/data/mockData';

const credBgMap: Record<MediaCredibility, string> = {
  verified: 'bg-ops-green/20 text-ops-green border-ops-green/30',
  reliable: 'bg-ops-cyan/20 text-ops-cyan border-ops-cyan/30',
  unconfirmed: 'bg-ops-amber/20 text-ops-amber border-ops-amber/30',
  disputed: 'bg-ops-red/20 text-ops-red border-ops-red/30',
};

interface MediaCarouselProps {
  media: WarMedia[];
}

export default function MediaCarousel({ media }: MediaCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % media.length);
  }, [media.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + media.length) % media.length);
  }, [media.length]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const item = media[current];
  if (!item) return null;
  const cred = CREDIBILITY_CONFIG[item.credibility];

  return (
    <div
      className="relative w-full h-full bg-card/50 overflow-hidden group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-background/90 to-transparent">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-ops-red pulse-dot" />
          <span className="text-[10px] font-bold tracking-widest text-primary glow-text-cyan">
            OSINT MEDIA FEED
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground font-mono">
          {current + 1}/{media.length}
        </span>
      </div>

      {/* Media */}
      {item.type === 'video' && item.url !== '#' ? (
        <div className="w-full h-full relative">
          <img
            src={item.thumbnail}
            alt={item.caption}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-background/70 border border-primary/50 flex items-center justify-center backdrop-blur-sm">
              <span className="text-primary ml-0.5">▶</span>
            </div>
          </div>
          <span className="absolute top-8 right-2 text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-ops-red/80 text-white">
            VIDEO
          </span>
        </div>
      ) : (
        <img
          src={item.thumbnail}
          alt={item.caption}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-3 space-y-1.5">
        {/* Credibility + source */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${credBgMap[item.credibility]}`}>
            {cred.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {item.source} · {item.platform}
          </span>
          {item.location && (
            <span className="text-[10px] text-ops-cyan/70 font-mono">
              📍 {item.location}
            </span>
          )}
        </div>
        {/* Caption */}
        <p className="text-[11px] text-foreground/90 leading-tight line-clamp-2">
          {item.caption}
        </p>
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
        {media.map((_, i) => (
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
