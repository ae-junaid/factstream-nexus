import { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NewsTicker from '@/components/dashboard/NewsTicker';
import StatsBanner from '@/components/dashboard/StatsBanner';
import UnifiedMap from '@/components/dashboard/UnifiedMap';
import EventTimeline from '@/components/dashboard/EventTimeline';
import EventDetail from '@/components/dashboard/EventDetail';
import MediaCarousel from '@/components/dashboard/MediaCarousel';
import ThreatAssessment from '@/components/dashboard/ThreatAssessment';
import ConflictOverview from '@/components/dashboard/ConflictOverview';
import AdSlot from '@/components/dashboard/AdSlot';
import { ConflictProvider, useConflict } from '@/contexts/ConflictContext';
import { useGdeltNews, useGdeltEvents } from '@/hooks/useGdeltData';
import { ConflictEvent } from '@/data/mockData';

function DashboardContent() {
  const [selectedEvent, setSelectedEvent] = useState<ConflictEvent | null>(null);
  const { selectedConflict } = useConflict();

  const { news, loading: newsLoading } = useGdeltNews(selectedConflict);
  const { events, loading: eventsLoading } = useGdeltEvents(selectedConflict);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <div className="scanline-overlay" />
      <DashboardHeader />
      <NewsTicker news={news} loading={newsLoading} />
      <StatsBanner conflict={selectedConflict} events={events} news={news} />

      {/* Main content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-auto lg:overflow-hidden">

        {/* LEFT — Event Timeline */}
        <div className="lg:col-span-3 flex flex-col min-h-[300px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-border bg-card">
          <div className="flex-1 overflow-hidden">
            <EventTimeline events={events} onEventSelect={setSelectedEvent} loading={eventsLoading} />
          </div>
          <AdSlot format="inline" className="shrink-0 mx-2 mb-2" />
        </div>

        {/* CENTER — Map + Media */}
        <div className="lg:col-span-5 flex flex-col min-h-[500px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-border">
          <div className="border-b border-border min-h-0" style={{ flex: '1 1 0%' }}>
            <MediaCarousel news={news} />
          </div>
          <div className="relative min-h-0" style={{ flex: '3 1 0%' }}>
            <UnifiedMap events={events} onEventSelect={setSelectedEvent} conflict={selectedConflict} />
            <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          </div>
        </div>

        {/* RIGHT — Intel panels */}
        <div className="lg:col-span-4 flex flex-col min-h-[300px] lg:min-h-0 bg-card">
          <div className="min-h-0 overflow-hidden border-b border-border" style={{ flex: '3 1 0%' }}>
            <ConflictOverview conflict={selectedConflict} events={events} news={news} />
          </div>
          <div className="min-h-0 overflow-hidden border-b border-border" style={{ flex: '2 1 0%' }}>
            <ThreatAssessment conflict={selectedConflict} events={events} loading={eventsLoading} />
          </div>
          <AdSlot format="inline" className="shrink-0 m-2" />
        </div>
      </div>

      {/* Footer */}
      <AdSlot format="banner" className="shrink-0 border-t border-border" />
      <footer className="px-4 py-1 border-t border-border bg-card/30 shrink-0">
        <p className="text-[8px] text-muted-foreground text-center tracking-wider">
          LIVE DATA FROM OPEN SOURCES — GDELT · ACLED · OCHA
        </p>
      </footer>
    </div>
  );
}

const Index = () => (
  <ConflictProvider>
    <DashboardContent />
  </ConflictProvider>
);

export default Index;
