import { useEffect, useState } from 'react';
import { Shield, Sun, Moon, ChevronDown } from 'lucide-react';
import { useConflict } from '@/contexts/ConflictContext';

export default function DashboardHeader() {
  const [time, setTime] = useState(new Date());
  const [isDark, setIsDark] = useState(() => !document.documentElement.classList.contains('light'));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { selectedConflict, setSelectedConflict, allConflicts } = useConflict();

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

      {/* Conflict Selector */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-ops-red pulse-dot" />
          <span className="text-[10px] font-bold tracking-wider text-foreground">
            {selectedConflict.shortLabel}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setDropdownOpen(false)} />
            <div className="absolute top-full mt-1 right-0 z-[9999] min-w-[240px] bg-card border border-border rounded shadow-lg overflow-hidden">
              {allConflicts.map(conflict => (
                <button
                  key={conflict.id}
                  onClick={() => {
                    setSelectedConflict(conflict);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[11px] tracking-wider hover:bg-secondary/50 transition-colors border-b border-border last:border-b-0 ${
                    selectedConflict.id === conflict.id ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedConflict.id === conflict.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    <span>{conflict.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-ops-green pulse-dot" />
          <span className="text-ops-green tracking-wider">LIVE</span>
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
