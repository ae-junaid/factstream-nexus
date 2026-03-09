import { useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Swords, Calendar, AlertTriangle, Globe, Radio, Target, BookOpen, ChevronsDown } from 'lucide-react';
import { ConflictZone } from '@/lib/conflicts';
import { ConflictEvent, NewsItem } from '@/data/mockData';

interface ConflictOverviewProps {
  conflict: ConflictZone;
  events: ConflictEvent[];
  news: NewsItem[];
}

const CONFLICT_CONTEXT: Record<string, {
  started: string;
  summary: string;
  background: string;
  majorTargets: string[];
  displaced: string;
  casualties: string;
  keyFact: string;
  sources: string[];
}> = {
  'iran-israel': {
    started: '28 Feb 2026',
    summary: 'A full-scale war erupted on February 28, 2026 when the US and Israel launched coordinated strikes on Iranian nuclear and military sites, including Natanz, Isfahan, and IRGC facilities in Tehran. Iran retaliated with large-scale ballistic missile barrages targeting Israeli military bases, US military installations across the Persian Gulf — including Al Udeid (Qatar), Al Dhafra (UAE/Dubai), Isa Air Base (Bahrain), and facilities in Oman and Saudi Arabia. Both sides have sustained significant military and civilian losses. The conflict has triggered a dual chokepoint crisis at the Strait of Hormuz and Bab el-Mandeb, disrupting global energy markets.',
    background: 'Rooted in the collapse of US-Iran nuclear negotiations and Iran\'s acceleration of uranium enrichment to near-weapons-grade levels. Israel\'s October 2024 strikes on Iranian military infrastructure set the stage. The US invoked emergency powers to authorize military action. Iran views the war as an existential defensive struggle; the US-Israel coalition frames it as preemptive nonproliferation. Regional allies on both sides have been drawn into the conflict, with Gulf states hosting US bases becoming targets of Iranian retaliation.',
    majorTargets: [
      'US-ISRAEL → Iranian nuclear facilities (Natanz, Isfahan, Fordow)',
      'US-ISRAEL → IRGC headquarters, missile arrays & air defenses in Tehran',
      'US-ISRAEL → Iranian oil infrastructure & ammunition depots',
      'IRAN → Israeli military bases & air defense systems',
      'IRAN → US bases: Al Udeid (Qatar), Al Dhafra (UAE), Isa AB (Bahrain)',
      'IRAN → US naval assets in Oman, Saudi Arabia & Persian Gulf',
      'IRAN → Energy infrastructure in Gulf states hosting coalition forces',
      'HOUTHIS → Red Sea shipping & coalition naval vessels',
    ],
    displaced: '500K+ Iran, 200K+ Gulf region',
    casualties: 'Thousands (both sides, est.)',
    keyFact: 'First direct US-Iran military confrontation — Gulf-wide theater — dual chokepoint crisis at Hormuz & Bab el-Mandeb — global oil prices surging',
    sources: ['Al Jazeera', 'Reuters', 'CNN', 'Press TV', 'France 24', 'CENTCOM', 'ISW'],
  },
  'ukraine-russia': {
    started: 'Feb 2022',
    summary: 'Russia\'s full-scale invasion of Ukraine has entered its 4th year. An estimated 500,000 have been killed on both sides, making it Europe\'s deadliest conflict since WWII. Russia occupies roughly 20% of Ukrainian territory but gains have slowed to a crawl — only ~1.3% of territory gained since the initial invasion. 2025 was the deadliest year for Ukrainian civilians since 2022, with casualties surging 26%. Drone and missile strikes on civilian infrastructure continue daily.',
    background: 'Began as Russia\'s "special military operation" on Feb 24, 2022, following years of tensions over NATO expansion and Ukraine\'s sovereignty. The front lines have largely solidified along eastern and southern Ukraine, with a land corridor to Crimea.',
    majorTargets: [
      'Ukrainian energy grid & civilian infrastructure',
      'Kharkiv, Zaporizhzhia, Donetsk front lines',
      'Crimean Bridge & Russian logistics in occupied areas',
      'Russian oil refineries & military airfields (Ukrainian strikes)',
      'Bakhmut/Chasiv Yar — grinding positional warfare',
    ],
    displaced: '6.7M+ internally, 6.5M+ refugees abroad',
    casualties: '~500,000 killed (both sides, est.)',
    keyFact: 'Europe\'s deadliest war since 1945 — Russia occupies ~20% of Ukraine — front lines largely frozen',
    sources: ['Le Monde', 'Reuters', 'UN HRMMU', 'Al Jazeera', 'CSIS'],
  },
  'yemen-red-sea': {
    started: 'Oct 2023 escalation',
    summary: 'Iran-backed Houthi forces have attacked dozens of merchant and naval vessels in the Red Sea since October 2023, demanding an end to the Gaza war. The US and allies have conducted hundreds of retaliatory airstrikes on Yemen. Following the Feb 2026 US-Israel strikes on Iran, Houthis announced resumption of intensified Red Sea attacks, creating a dual chokepoint crisis threatening both the Strait of Hormuz and Bab el-Mandeb simultaneously.',
    background: 'Linked to Yemen\'s civil war (since 2014), the Gaza conflict, and Iran\'s broader proxy strategy. Houthis control northwestern Yemen including Sanaa. The Red Sea crisis has forced major shipping lines to reroute around Africa, adding weeks and billions in costs.',
    majorTargets: [
      'Commercial shipping in Red Sea & Gulf of Aden',
      'US Navy vessels (USS Eisenhower, USS Carney targeted)',
      'Houthi missile & drone launch sites in Yemen',
      'Hodeidah port & Houthi military infrastructure',
      'Strait of Hormuz shipping lanes (post-Feb 2026)',
    ],
    displaced: '4.5M+ (Yemen civil war total)',
    casualties: '150,000+ (Yemen war total)',
    keyFact: '12% of global trade transits the Red Sea — dual chokepoint crisis with Hormuz after Iran war escalation',
    sources: ['gCaptain', 'FreightWaves', 'Wikipedia/Red Sea crisis', 'The Hindu'],
  },
  'sudan': {
    started: 'Apr 2023',
    summary: 'Civil war between the Sudanese Armed Forces (SAF) and the Rapid Support Forces (RSF) has created the world\'s largest displacement crisis. As of January 2026, nearly one in three Sudanese — over 15 million people — have been displaced internally or across borders. In 2026, 33.7 million people require humanitarian assistance. The health system has collapsed, with 21 million needing health support. Widespread atrocities reported in Darfur including ethnic cleansing.',
    background: 'Fighting erupted in April 2023 between SAF chief Gen. Burhan and RSF leader Gen. Dagalo (Hemedti) over power-sharing and military integration. The RSF, rooted in Darfur\'s Janjaweed militia, controls large swaths of western and central Sudan while SAF holds Port Sudan and parts of the east.',
    majorTargets: [
      'Khartoum — capital devastated, bridges destroyed',
      'Darfur — El Fasher besieged, ethnic cleansing reported',
      'Essential services & hospitals systematically targeted',
      'Omdurman — major city largely destroyed',
      'Agricultural regions — famine spreading across Sudan',
    ],
    displaced: '15M+ (world\'s largest)',
    casualties: '20,000-150,000 (est. varies widely)',
    keyFact: 'World\'s largest displacement crisis — 1 in 3 Sudanese displaced — 33.7M need aid in 2026',
    sources: ['IOM', 'MSF', 'OCHA', 'ReliefWeb', 'CFR', 'Al Jazeera'],
  },
  'myanmar': {
    started: 'Feb 2021 coup',
    summary: 'Following the military coup on Feb 1, 2021, a nationwide armed resistance emerged. Ethnic Armed Organizations (EAOs) and People\'s Defence Forces (PDFs) have made significant territorial gains, especially during 2024\'s Operation 1027. The junta has lost control of significant border territories. However, internal resistance fractures emerged in early 2026, with some rebel leaders surrendering to the junta. Myanmar held controversial junta-organized elections beginning in 2026 amid ongoing conflict.',
    background: 'The Tatmadaw (military) overthrew the elected government of Aung San Suu Kyi. The National Unity Government (NUG) coordinates armed resistance alongside dozens of ethnic armed groups. China plays a complex role, pressuring some ethnic groups near its border while maintaining ties with the junta.',
    majorTargets: [
      'Junta military bases across Shan, Rakhine, Chin states',
      'Border trade posts — key revenue sources seized by resistance',
      'Yangon — urban guerrilla attacks on junta targets',
      'Myawaddy & border crossings with Thailand',
      'Mandalay — strategic center contested by resistance forces',
    ],
    displaced: '3.4M+ internally displaced',
    casualties: '6,000+ civilians killed by junta',
    keyFact: 'Junta losing territory but resistance fractured — controversial 2026 elections amid civil war — tipping point predicted',
    sources: ['CFR', 'Asia Times', 'Soufan Center', 'East Asia Forum', 'SCMP'],
  },
};

export default function ConflictOverview({ conflict, events, news }: ConflictOverviewProps) {
  const context = CONFLICT_CONTEXT[conflict.id] || {
    started: 'Unknown',
    summary: 'Conflict monitoring active.',
    background: '',
    majorTargets: [],
    displaced: 'N/A',
    casualties: 'N/A',
    keyFact: 'Data collection in progress',
    sources: [],
  };

  const stats = useMemo(() => {
    const recentEvents = events.length;
    const liveSources = new Set(news.map(n => n.source)).size;
    return { recentEvents, liveSources };
  }, [events, news]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
    el.parentElement?.classList.toggle('scrolled-bottom', isAtBottom);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-primary/10 border border-primary/20">
            <Globe className="w-3 h-3 text-primary" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold tracking-widest text-primary glow-text-cyan leading-none">
              SITUATION BRIEFING
            </h2>
            <span className="text-[8px] text-muted-foreground tracking-wider">{conflict.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio className="w-2.5 h-2.5 text-ops-green pulse-dot" />
          <span className="text-[9px] text-ops-green font-bold tracking-wider">LIVE</span>
          <ChevronsDown className="w-3 h-3 text-primary/50 animate-bounce ml-1" />
        </div>
      </div>

      <div className="scroll-fade-container flex-1 overflow-hidden">
        <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto p-3 space-y-3">
        {/* Parties row */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 flex-wrap"
        >
          <Swords className="w-3 h-3 text-ops-amber shrink-0" />
          {conflict.parties.map((party, i) => (
            <span key={party} className="flex items-center gap-1">
              <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-sm border border-border bg-secondary/60 text-foreground">
                {party}
              </span>
              {i < conflict.parties.length - 1 && (
                <span className="text-[8px] text-muted-foreground">vs</span>
              )}
            </span>
          ))}
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded border border-border bg-secondary/20 p-2.5"
        >
          <p className="text-[10px] text-foreground/80 leading-[1.6]">
            {context.summary}
          </p>
        </motion.div>

        {/* Background */}
        {context.background && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded border border-primary/20 bg-primary/5 p-2.5"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3 h-3 text-primary" />
              <span className="text-[8px] text-primary tracking-widest font-bold">BACKGROUND</span>
            </div>
            <p className="text-[9px] text-foreground/70 leading-[1.6]">
              {context.background}
            </p>
          </motion.div>
        )}

        {/* Stats — horizontal row */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { icon: Calendar, label: 'SINCE', value: context.started, color: 'text-primary' },
            { icon: Users, label: 'DISPLACED', value: context.displaced, color: 'text-ops-amber' },
            { icon: AlertTriangle, label: 'KILLED', value: context.casualties, color: 'text-ops-red' },
            { icon: MapPin, label: 'EVENTS', value: String(stats.recentEvents), color: 'text-ops-cyan' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.03 }}
              className="flex flex-col items-center text-center p-1.5 rounded border border-border bg-background/50 overflow-hidden"
            >
              <card.icon className={`w-3 h-3 ${card.color} mb-1 shrink-0`} />
              <span className="text-[11px] font-bold text-foreground leading-tight line-clamp-2 break-words w-full">{card.value}</span>
              <span className="text-[7px] text-muted-foreground tracking-widest mt-0.5">{card.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Major Targets */}
        {context.majorTargets && context.majorTargets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded border border-ops-red/20 bg-ops-red/5 p-2.5"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Target className="w-3 h-3 text-ops-red" />
              <span className="text-[8px] text-ops-red tracking-widest font-bold">MAJOR TARGETS / DEVELOPMENTS</span>
            </div>
            <ul className="space-y-1">
              {context.majorTargets.map((target, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[6px] text-ops-red mt-1">▸</span>
                  <span className="text-[9px] text-foreground/70 leading-relaxed">{target}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Key fact — accent callout */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="relative rounded border border-ops-amber/30 bg-ops-amber/5 p-2.5 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-ops-amber/60 rounded-l" />
          <div className="flex items-start gap-2 pl-1">
            <AlertTriangle className="w-3.5 h-3.5 text-ops-amber shrink-0 mt-0.5" />
            <div>
              <span className="text-[8px] text-ops-amber tracking-widest font-bold">KEY INTELLIGENCE</span>
              <p className="text-[10px] text-foreground/80 mt-0.5 leading-relaxed">{context.keyFact}</p>
            </div>
          </div>
        </motion.div>

        {/* Regions + Sources footer */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div>
            <span className="text-[7px] text-muted-foreground tracking-[0.15em] uppercase">Monitored Regions</span>
            <div className="flex items-center gap-1 flex-wrap mt-1">
              {conflict.regions.map(r => (
                <span key={r} className="text-[8px] text-muted-foreground/80 px-1.5 py-0.5 rounded-sm bg-secondary/40 border border-border/50">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-muted-foreground tracking-wider">
              <span className="text-primary font-bold">{stats.liveSources}</span> LIVE FEEDS
            </span>
            <span className="text-[7px] text-muted-foreground/60 tracking-wider">
              {(context.sources || []).join(' · ')}
            </span>
          </div>
        </div>
        </div>
      </div>
      </div>
    </div>
  );
}
