import { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NewsTicker from '@/components/dashboard/NewsTicker';
import UnifiedMap from '@/components/dashboard/UnifiedMap';
import EventTimeline from '@/components/dashboard/EventTimeline';
import StatsPanel from '@/components/dashboard/StatsPanel';
import EventDetail from '@/components/dashboard/EventDetail';
import MediaCarousel from '@/components/dashboard/MediaCarousel';
import ThreatAssessment from '@/components/dashboard/ThreatAssessment';
import AirspaceMonitor from '@/components/dashboard/AirspaceMonitor';
import { mockEvents, mockNews, mockStats, ConflictEvent } from '@/data/mockData';
import { mockWarMedia } from '@/data/mediaData';

const Index = () => {
  const [selectedEvent, setSelectedEvent] = useState<ConflictEvent | null>(null);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <div className="scanline-overlay" />
      <DashboardHeader />
      <NewsTicker news={mockNews} />

      {/* Main content */}
      <div className="flex-1 flex flex-col xl:flex-row min-h-0 overflow-auto xl:overflow-hidden">

        {/* LEFT — Unified Map (dominant) */}
        <div className="xl:flex-1 flex flex-col min-h-[350px] xl:min-h-0 border-b xl:border-b-0 xl:border-r border-border">
          {/* Map */}
          <div className="flex-1 relative min-h-[300px] xl:min-h-0">
            <UnifiedMap events={mockEvents} onEventSelect={setSelectedEvent} />
            <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          </div>
          {/* Media strip below map */}
          <div className="h-32 sm:h-36 border-t border-border shrink-0">
            <MediaCarousel media={mockWarMedia} />
          </div>
        </div>

        {/* RIGHT — Intel panels */}
        <div className="w-full xl:w-[380px] 2xl:w-[420px] flex flex-col min-h-0 shrink-0">
          {/* Event Timeline */}
          <div className="flex-1 min-h-[200px] xl:min-h-0 overflow-hidden border-b border-border">
            <EventTimeline events={mockEvents} onEventSelect={setSelectedEvent} />
          </div>
          {/* Stats */}
          <div className="h-auto xl:h-44 border-b border-border shrink-0">
            <StatsPanel stats={mockStats} />
          </div>
          {/* Threat Assessment */}
          <div className="h-auto xl:h-48 border-b border-border shrink-0">
            <ThreatAssessment />
          </div>
          {/* Airspace */}
          <div className="h-auto xl:h-40 shrink-0">
            <AirspaceMonitor />
          </div>
        </div>
      </div>

      <footer className="px-4 py-1 border-t border-border bg-card/30 shrink-0">
        <p className="text-[8px] text-muted-foreground text-center tracking-wider">
          DATA AGGREGATED FROM OPEN SOURCES — REUTERS · AP · BBC · AL JAZEERA · OCHA · ACLED · GDELT · ADS-B EXCHANGE · MARINETRAFFIC · OPENSKY
        </p>
      </footer>
    </div>
  );
};

export default Index;
