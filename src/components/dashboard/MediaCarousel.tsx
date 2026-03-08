import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NewsItem, CREDIBILITY_CONFIG } from '@/data/mockData';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [newFlash, setNewFlash] = useState<Set<string>>(new Set());
  const prevCountRef = useRef(news.length);
  const navigate = useNavigate();

  useEffect(() => {
    if (news.length > prevCountRef.current) {
      const newIds = new Set(news.slice(0, news.length - prevCountRef.current).map(n => n.id));
      setNewFlash(newIds);
      const timer = setTimeout(() => setNewFlash(new Set()), 3000);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = news.length;
  }, [news]);

  const handleArticleClick = (item: NewsItem, title: string, source: string) => {
    const params = new URLSearchParams({
      url: item.url,
      title: encodeURIComponent(title),
      source: encodeURIComponent(source),
    });
    navigate(`/article?${params.toString()}`);
  };

  if (news.length === 0) {
    return (
      <div className="w-full h-full bg-card/50 flex items-center justify-center">
        <div className="text-center space-y-1">
          <div className="inline-block w-1.5 h-1.5 rounded-full bg-ops-amber pulse-dot" />
          <p className="text-[10px] text-muted-foreground tracking-wider">AWAITING LIVE FEED...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-1.5 bg-card/80 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-ops-red pulse-dot" />
          <span className="text-[10px] font-bold tracking-widest text-primary glow-text-cyan">MAJOR UPDATES</span>
        </div>
        <span className="text-[9px] text-muted-foreground font-mono">{news.length} STORIES</span>
      </div>

      {/* Scrollable feed */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="divide-y divide-border">
          {news.slice(0, 20).map((item, i) => {
            const { title, source: parsedSource } = cleanHeadline(item.headline);
            const displaySource = parsedSource || item.source;
            const cred = CREDIBILITY_CONFIG[item.credibility];
            const isNew = newFlash.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleArticleClick(item, title, displaySource)}
                className={`block px-3 py-2.5 hover:bg-secondary/40 transition-all group cursor-pointer ${
                  isNew ? 'bg-primary/5 animate-pulse' : ''
                } ${i === 0 ? 'bg-secondary/20' : ''}`}
              >
                {/* Top row */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[8px] font-bold tracking-wider px-1 py-0.5 rounded border ${credBgMap[item.credibility]}`}>
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

                {/* Headline */}
                <p className={`text-[11px] leading-snug font-medium text-foreground/90 group-hover:text-primary transition-colors ${
                  i === 0 ? 'text-xs font-semibold' : 'line-clamp-2'
                }`}>
                  {title}
                  <ExternalLink className="inline w-2.5 h-2.5 ml-1 opacity-30 group-hover:opacity-70" />
                </p>

                {i === 0 && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[8px] font-bold tracking-widest text-ops-red">● LATEST</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
