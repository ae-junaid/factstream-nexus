import { Megaphone } from 'lucide-react';

interface AdSlotProps {
  format: 'banner' | 'sidebar' | 'inline';
  className?: string;
}

export default function AdSlot({ format, className = '' }: AdSlotProps) {
  const sizes: Record<string, string> = {
    banner: 'h-[90px] w-full',
    sidebar: 'h-[250px] w-full',
    inline: 'h-[60px] w-full',
  };

  return (
    <div className={`${sizes[format]} ${className} flex items-center justify-center border border-dashed border-border/50 bg-card/30 rounded`}>
      {/* 
        Replace this placeholder with your Google AdSense code:
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true" />
      */}
      <div className="flex items-center gap-2 text-muted-foreground/40">
        <Megaphone className="w-3.5 h-3.5" />
        <span className="text-[9px] tracking-widest uppercase">Ad Space</span>
      </div>
    </div>
  );
}
