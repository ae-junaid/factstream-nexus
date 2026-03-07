import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

export default function DashboardHeader() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const utc = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' });
  const local = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const date = time.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-sm font-bold tracking-wider text-foreground">
            CONFLICT<span className="text-primary">MONITOR</span>
          </h1>
          <p className="text-[9px] text-muted-foreground tracking-widest">OPEN SOURCE INTELLIGENCE DASHBOARD</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-ops-green pulse-dot" />
          <span className="text-ops-green tracking-wider">SYSTEMS ONLINE</span>
        </div>
        <span className="text-border">|</span>
        <span>{date}</span>
        <span className="text-border">|</span>
        <span>UTC {utc}</span>
        <span className="text-border">|</span>
        <span>LOCAL {local}</span>
      </div>
    </header>
  );
}
