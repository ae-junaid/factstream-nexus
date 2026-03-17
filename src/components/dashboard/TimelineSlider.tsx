import { useState, useMemo } from 'react';
import { Clock } from 'lucide-react';

interface TimelineSliderProps {
  events: { timestamp: string }[];
  onRangeChange: (range: [Date, Date] | null) => void;
}

export default function TimelineSlider({ events, onRangeChange }: TimelineSliderProps) {
  const [value, setValue] = useState(100);

  const { minTime, maxTime } = useMemo(() => {
    if (events.length === 0) return { minTime: Date.now() - 86400000, maxTime: Date.now() };
    const times = events.map(e => new Date(e.timestamp).getTime()).filter(t => !isNaN(t));
    return { minTime: Math.min(...times), maxTime: Math.max(...times) };
  }, [events]);

  const handleChange = (val: number) => {
    setValue(val);
    if (val >= 100) {
      onRangeChange(null); // show all
    } else {
      const range = maxTime - minTime;
      const cutoff = minTime + (range * val / 100);
      onRangeChange([new Date(minTime), new Date(cutoff)]);
    }
  };

  const formatLabel = () => {
    if (value >= 100) return 'ALL';
    const range = maxTime - minTime;
    const cutoff = new Date(minTime + (range * value / 100));
    return cutoff.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border rounded px-3 py-1.5 shadow-lg">
      <Clock className="w-3 h-3 text-primary shrink-0" />
      <span className="text-[9px] text-muted-foreground tracking-wider shrink-0">TIME</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => handleChange(Number(e.target.value))}
        className="w-24 sm:w-36 h-1 accent-primary cursor-pointer"
        style={{ accentColor: 'hsl(var(--primary))' }}
      />
      <span className="text-[9px] font-mono text-primary tracking-wider shrink-0 min-w-[32px] text-center">
        {formatLabel()}
      </span>
    </div>
  );
}
