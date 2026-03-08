import { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NewsTicker from '@/components/dashboard/NewsTicker';
import ConflictMap from '@/components/dashboard/ConflictMap';
import EventTimeline from '@/components/dashboard/EventTimeline';
import StatsPanel from '@/components/dashboard/StatsPanel';
import EventDetail from '@/components/dashboard/EventDetail';
import MediaCarousel from '@/components/dashboard/MediaCarousel';
import FlightTracker from '@/components/dashboard/FlightTracker';
import MaritimeTracker from '@/components/dashboard/MaritimeTracker';
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

      {/* Main grid — 3 columns */}
      <div className="flex-1 grid grid-cols-12 gap-px bg-border min-h-0">

        {/* LEFT COLUMN — Event Timeline + Stats */}
        <div className="col-span-3 bg-card flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden">
            <EventTimeline events={mockEvents} onEventSelect={setSelectedEvent} />
          </div>
          <div className="h-48 border-t border-border shrink-0">
            <StatsPanel stats={mockStats} />
          </div>
        </div>

        {/* CENTER COLUMN — Map + Media + Maritime */}
        <div className="col-span-5 bg-background flex flex-col min-h-0">
          <div className="h-[45%] relative shrink-0">
            <ConflictMap events={mockEvents} onEventSelect={setSelectedEvent} />
            <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          </div>
          <div className="h-40 border-t border-border shrink-0">
            <MediaCarousel media={mockWarMedia} />
          </div>
          <div className="flex-1 border-t border-border min-h-0">
            <MaritimeTracker />
          </div>
        </div>

        {/* RIGHT COLUMN — Flight Tracker + Threat + Airspace */}
        <div className="col-span-4 bg-card flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden">
            <FlightTracker />
          </div>
          <div className="h-[35%] border-t border-border shrink-0">
            <ThreatAssessment />
          </div>
          <div className="h-[30%] border-t border-border shrink-0">
            <AirspaceMonitor />
          </div>
        </div>
      </div>

      <footer className="px-4 py-1 border-t border-border bg-card/30">
        <p className="text-[9px] text-muted-foreground text-center tracking-wider">
          DATA AGGREGATED FROM OPEN SOURCES — REUTERS · AP · BBC · AL JAZEERA · OCHA · ACLED · GDELT · ADS-B EXCHANGE · MARINETRAFFIC · OPENSKY — NO EDITORIAL BIAS APPLIED
        </p>
      </footer>
    </div>
  );
};

export default Index;
