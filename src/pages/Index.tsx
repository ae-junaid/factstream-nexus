import { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NewsTicker from '@/components/dashboard/NewsTicker';
import StatsBanner from '@/components/dashboard/StatsBanner';
import UnifiedMap from '@/components/dashboard/UnifiedMap';
import EventTimeline from '@/components/dashboard/EventTimeline';
import EventDetail from '@/components/dashboard/EventDetail';
import MediaCarousel from '@/components/dashboard/MediaCarousel';
import ThreatAssessment from '@/components/dashboard/ThreatAssessment';
import AirspaceMonitor from '@/components/dashboard/AirspaceMonitor';
import AdSlot from '@/components/dashboard/AdSlot';
import { mockEvents, mockNews, mockStats, ConflictEvent } from '@/data/mockData';
import { mockWarMedia } from '@/data/mediaData';

const Index = () => {
  const [selectedEvent, setSelectedEvent] = useState<ConflictEvent | null>(null);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <div className="scanline-overlay" />
      <DashboardHeader />
      <NewsTicker news={mockNews} />
      <StatsBanner stats={mockStats} />

      {/* Main content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-auto lg:overflow-hidden">

        {/* LEFT — Event Timeline */}
        <div className="lg:col-span-3 flex flex-col min-h-[300px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-border bg-card">
          <div className="flex-1 overflow-hidden">
            <EventTimeline events={mockEvents} onEventSelect={setSelectedEvent} />
          </div>
          <AdSlot format="inline" className="shrink-0 mx-2 mb-2" />
        </div>

        {/* CENTER — Map + Media (equal split) */}
        <div className="lg:col-span-5 flex flex-col min-h-[500px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex-1 relative min-h-0">
            <UnifiedMap events={mockEvents} onEventSelect={setSelectedEvent} />
            <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          </div>
          <div className="flex-1 border-t border-border min-h-0">
            <MediaCarousel media={mockWarMedia} />
          </div>
        </div>

        {/* RIGHT — Intel panels + Ad */}
        <div className="lg:col-span-4 flex flex-col min-h-[300px] lg:min-h-0 bg-card">
          <div className="flex-1 min-h-0 overflow-hidden border-b border-border">
            <ThreatAssessment />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden border-b border-border">
            <AirspaceMonitor />
          </div>
          <AdSlot format="inline" className="shrink-0 m-2" />
        </div>
      </div>

      {/* Footer ad banner */}
      <AdSlot format="banner" className="shrink-0 border-t border-border" />

      <footer className="px-4 py-1 border-t border-border bg-card/30 shrink-0">
        <p className="text-[8px] text-muted-foreground text-center tracking-wider">
          DATA AGGREGATED FROM OPEN SOURCES — REUTERS · AP · BBC · AL JAZEERA · OCHA · ACLED · GDELT · ADS-B EXCHANGE · OPENSKY NETWORK · MARINETRAFFIC (FREE)
        </p>
      </footer>
    </div>
  );
};

export default Index;
