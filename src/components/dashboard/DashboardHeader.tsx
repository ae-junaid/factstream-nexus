import { useEffect, useState } from 'react';
import { Shield, Sun, Moon } from 'lucide-react';

export default function DashboardHeader() {
  const [time, setTime] = useState(new Date());
  const [isDark, setIsDark] = useState(() => !document.documentElement.classList.contains('light'));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  };

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
        <span className="text-border">|</span>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-border hover:bg-secondary transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-3 h-3 text-accent" /> : <Moon className="w-3 h-3 text-primary" />}
          <span className="tracking-wider">{isDark ? 'LIGHT' : 'DARK'}</span>
        </button>
      </div>
    </header>
  );
}
