import { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NewsTicker from '@/components/dashboard/NewsTicker';
import ConflictMap from '@/components/dashboard/ConflictMap';
import EventTimeline from '@/components/dashboard/EventTimeline';
import StatsPanel from '@/components/dashboard/StatsPanel';
import EventDetail from '@/components/dashboard/EventDetail';
import { mockEvents, mockNews, mockStats, ConflictEvent } from '@/data/mockData';

const Index = () => {
  const [selectedEvent, setSelectedEvent] = useState<ConflictEvent | null>(null);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      <DashboardHeader />
      <NewsTicker news={mockNews} />

      <div className="flex-1 flex min-h-0">
        {/* Map - center, takes most space */}
        <div className="flex-1 relative">
          <ConflictMap events={mockEvents} onEventSelect={setSelectedEvent} />
          <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </div>

        {/* Right sidebar */}
        <div className="w-80 border-l border-border flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden">
            <EventTimeline events={mockEvents} onEventSelect={setSelectedEvent} />
          </div>
          <div className="h-64 border-t border-border shrink-0">
            <StatsPanel stats={mockStats} />
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <footer className="px-4 py-1 border-t border-border bg-card/30">
        <p className="text-[9px] text-muted-foreground text-center tracking-wider">
          DATA AGGREGATED FROM OPEN SOURCES — REUTERS · AP · BBC · AL JAZEERA · OCHA · ACLED · GDELT — NO EDITORIAL BIAS APPLIED — ALL CLAIMS MARKED BY VERIFICATION STATUS
        </p>
      </footer>
    </div>
  );
};

export default Index;
