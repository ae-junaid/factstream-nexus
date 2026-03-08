export type EventType = 'airstrike' | 'ground_operation' | 'rocket_attack' | 'diplomatic' | 'humanitarian' | 'naval' | 'cyber';
export type SourceCredibility = 'verified' | 'reliable' | 'unconfirmed' | 'disputed';

export interface ConflictEvent {
  id: string;
  timestamp: string;
  type: EventType;
  title: string;
  description: string;
  location: { lat: number; lng: number; name: string };
  source: string;
  credibility: SourceCredibility;
  casualties?: { reported: number; verified: boolean };
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  credibility: SourceCredibility;
  timestamp: string;
  url: string;
  imageUrl?: string;
}

export interface HumanitarianStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  source: string;
  lastUpdated: string;
}

export const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string }> = {
  airstrike: { label: 'AIRSTRIKE', color: 'ops-red' },
  ground_operation: { label: 'GROUND OP', color: 'ops-amber' },
  rocket_attack: { label: 'ROCKET', color: 'ops-red' },
  diplomatic: { label: 'DIPLOMATIC', color: 'ops-blue' },
  humanitarian: { label: 'HUMANITARIAN', color: 'ops-green' },
  naval: { label: 'NAVAL', color: 'ops-cyan' },
  cyber: { label: 'CYBER', color: 'ops-amber' },
};

export const CREDIBILITY_CONFIG: Record<SourceCredibility, { label: string; color: string }> = {
  verified: { label: 'VERIFIED', color: 'ops-green' },
  reliable: { label: 'RELIABLE', color: 'ops-cyan' },
  unconfirmed: { label: 'UNCONFIRMED', color: 'ops-amber' },
  disputed: { label: 'DISPUTED', color: 'ops-red' },
};

// ── Per-conflict mock events ────────────────────────────────────────
const iranIsraelEvents: ConflictEvent[] = [
  { id: 'evt-ii-001', timestamp: '2026-03-07T14:32:00Z', type: 'airstrike', title: 'Airstrikes reported in southern Lebanon', description: 'Multiple airstrikes in Nabatieh governorate targeting infrastructure.', location: { lat: 33.38, lng: 35.48, name: 'Nabatieh, Lebanon' }, source: 'Reuters', credibility: 'verified', casualties: { reported: 0, verified: false } },
  { id: 'evt-ii-002', timestamp: '2026-03-07T13:15:00Z', type: 'rocket_attack', title: 'Rocket barrage toward northern Israel', description: '30 rockets launched from southern Lebanon. Iron Dome interceptions reported.', location: { lat: 33.21, lng: 35.57, name: 'Kiryat Shmona, Israel' }, source: 'AP News', credibility: 'verified' },
  { id: 'evt-ii-003', timestamp: '2026-03-07T12:45:00Z', type: 'ground_operation', title: 'Military operations in Rafah corridor', description: 'IDF operations in the Rafah border area. Tank movements near Egyptian border.', location: { lat: 31.30, lng: 34.25, name: 'Rafah, Gaza' }, source: 'Al Jazeera', credibility: 'reliable', casualties: { reported: 12, verified: false } },
  { id: 'evt-ii-004', timestamp: '2026-03-07T11:00:00Z', type: 'diplomatic', title: 'UN Security Council emergency session called', description: 'France and UK push for emergency UNSC session on regional tensions.', location: { lat: 31.77, lng: 35.23, name: 'Jerusalem, Israel' }, source: 'BBC', credibility: 'verified' },
  { id: 'evt-ii-005', timestamp: '2026-03-07T10:30:00Z', type: 'humanitarian', title: 'UNRWA aid convoy reaches Khan Younis', description: 'First aid delivery in 72 hours. Critical shortages of medical supplies persist.', location: { lat: 31.35, lng: 34.31, name: 'Khan Younis, Gaza' }, source: 'OCHA', credibility: 'verified' },
  { id: 'evt-ii-006', timestamp: '2026-03-07T09:20:00Z', type: 'naval', title: 'Houthi drone intercept in Red Sea', description: 'US Navy destroyer intercepts drone launched from Yemen toward shipping lane.', location: { lat: 14.5, lng: 42.5, name: 'Red Sea, off Yemen' }, source: 'CENTCOM', credibility: 'verified' },
  { id: 'evt-ii-007', timestamp: '2026-03-07T08:00:00Z', type: 'airstrike', title: 'Strikes on suspected weapons depot in Syria', description: 'Unattributed airstrikes near Damascus. Syrian state media reports casualties.', location: { lat: 33.51, lng: 36.29, name: 'Damascus, Syria' }, source: 'SANA / SOHR', credibility: 'unconfirmed', casualties: { reported: 5, verified: false } },
  { id: 'evt-ii-008', timestamp: '2026-03-07T07:15:00Z', type: 'cyber', title: 'Cyberattack disrupts Iranian infrastructure', description: 'Widespread internet disruption in Iranian provinces. Attribution unclear.', location: { lat: 35.69, lng: 51.39, name: 'Tehran, Iran' }, source: 'NetBlocks', credibility: 'reliable' },
  { id: 'evt-ii-009', timestamp: '2026-03-07T06:45:00Z', type: 'ground_operation', title: 'IDF withdrawal from Jenin completed', description: '48-hour operation in Jenin refugee camp concluded. 8 fatalities reported.', location: { lat: 32.46, lng: 35.29, name: 'Jenin, West Bank' }, source: 'Times of Israel', credibility: 'reliable', casualties: { reported: 8, verified: false } },
  { id: 'evt-ii-010', timestamp: '2026-03-07T05:00:00Z', type: 'rocket_attack', title: 'Militia rockets hit US base in Iraq', description: '3 rockets strike Ain al-Asad airbase. Iran-aligned militia claims responsibility.', location: { lat: 33.79, lng: 43.56, name: 'Ain al-Asad, Iraq' }, source: 'Pentagon', credibility: 'verified' },
];

const ukraineRussiaEvents: ConflictEvent[] = [
  { id: 'evt-ur-001', timestamp: '2026-03-07T14:00:00Z', type: 'rocket_attack', title: 'Russian missile strike on Kharkiv residential area', description: 'Ballistic missile strikes residential building in Kharkiv. Emergency services on scene.', location: { lat: 49.99, lng: 36.23, name: 'Kharkiv, Ukraine' }, source: 'Ukrinform', credibility: 'verified', casualties: { reported: 10, verified: false } },
  { id: 'evt-ur-002', timestamp: '2026-03-07T12:30:00Z', type: 'ground_operation', title: 'Ukrainian counteroffensive near Bakhmut', description: 'Ukrainian forces advance on southern flank of Bakhmut salient. Heavy fighting reported.', location: { lat: 48.60, lng: 37.99, name: 'Bakhmut, Donetsk' }, source: 'ISW', credibility: 'verified' },
  { id: 'evt-ur-003', timestamp: '2026-03-07T11:15:00Z', type: 'airstrike', title: 'Russian strikes on Zaporizhzhia energy infrastructure', description: 'Kamikaze drones target power grid in Zaporizhzhia oblast. Partial blackout reported.', location: { lat: 47.84, lng: 35.14, name: 'Zaporizhzhia, Ukraine' }, source: 'Energoatom', credibility: 'reliable' },
  { id: 'evt-ur-004', timestamp: '2026-03-07T10:00:00Z', type: 'diplomatic', title: 'Trump proposes new peace framework for Ukraine', description: 'US president outlines territorial compromise plan. Kyiv rejects proposal.', location: { lat: 50.45, lng: 30.52, name: 'Kyiv, Ukraine' }, source: 'Reuters', credibility: 'verified' },
  { id: 'evt-ur-005', timestamp: '2026-03-07T09:00:00Z', type: 'airstrike', title: 'Ukrainian drone strikes Russian oil depot in Kursk', description: 'Long-range drones hit fuel storage facility. Fire visible from satellite imagery.', location: { lat: 51.73, lng: 36.19, name: 'Kursk, Russia' }, source: 'OSINT / Planet Labs', credibility: 'reliable' },
  { id: 'evt-ur-006', timestamp: '2026-03-07T08:00:00Z', type: 'humanitarian', title: 'UNHCR evacuates civilians from Kherson frontline', description: 'Emergency evacuation of 1,200 civilians from eastern Kherson bank under fire.', location: { lat: 46.64, lng: 32.62, name: 'Kherson, Ukraine' }, source: 'UNHCR', credibility: 'verified' },
  { id: 'evt-ur-007', timestamp: '2026-03-07T07:00:00Z', type: 'naval', title: 'Black Sea Fleet movement detected near Crimea', description: 'Satellite shows Russian naval vessels repositioning near Sevastopol.', location: { lat: 44.62, lng: 33.52, name: 'Sevastopol, Crimea' }, source: 'Naval News', credibility: 'reliable' },
  { id: 'evt-ur-008', timestamp: '2026-03-07T06:00:00Z', type: 'cyber', title: 'Russian cyberattack on Ukrainian banking system', description: 'DDoS attack disrupts online banking services across Ukraine for several hours.', location: { lat: 50.45, lng: 30.52, name: 'Kyiv, Ukraine' }, source: 'CERT-UA', credibility: 'verified' },
];

const yemenRedSeaEvents: ConflictEvent[] = [
  { id: 'evt-yr-001', timestamp: '2026-03-07T13:00:00Z', type: 'naval', title: 'Houthi anti-ship missile targets container vessel', description: 'Missile launched toward commercial shipping in Bab el-Mandeb strait. US Navy intercepts.', location: { lat: 12.8, lng: 43.3, name: 'Bab el-Mandeb, Red Sea' }, source: 'CENTCOM', credibility: 'verified' },
  { id: 'evt-yr-002', timestamp: '2026-03-07T11:30:00Z', type: 'airstrike', title: 'US/UK coalition strikes on Houthi coastal batteries', description: 'Joint strikes hit anti-ship missile launchers along the Yemeni coast.', location: { lat: 14.8, lng: 42.95, name: 'Hodeidah, Yemen' }, source: 'UK MoD', credibility: 'verified' },
  { id: 'evt-yr-003', timestamp: '2026-03-07T10:00:00Z', type: 'rocket_attack', title: 'Houthi drone swarm targets Saudi Aramco facility', description: 'Multiple explosive drones intercepted near Jizan oil terminal.', location: { lat: 16.89, lng: 42.55, name: 'Jizan, Saudi Arabia' }, source: 'SPA', credibility: 'reliable' },
  { id: 'evt-yr-004', timestamp: '2026-03-07T08:45:00Z', type: 'humanitarian', title: 'WFP warns of famine risk in northern Yemen', description: 'Food aid deliveries blocked for 2 weeks. 3.5 million at risk of severe hunger.', location: { lat: 15.37, lng: 44.19, name: "Sana'a, Yemen" }, source: 'WFP', credibility: 'verified' },
  { id: 'evt-yr-005', timestamp: '2026-03-07T07:15:00Z', type: 'naval', title: 'Commercial shipping rerouted via Cape of Good Hope', description: 'Major shipping lines confirm indefinite Red Sea avoidance. Freight costs surge 300%.', location: { lat: 20.0, lng: 38.5, name: 'Red Sea corridor' }, source: 'Lloyd\'s List', credibility: 'verified' },
  { id: 'evt-yr-006', timestamp: '2026-03-07T06:00:00Z', type: 'ground_operation', title: 'Saudi-backed forces clash with Houthis in Marib', description: 'Heavy fighting around Marib city. Both sides report territorial gains.', location: { lat: 15.46, lng: 45.32, name: 'Marib, Yemen' }, source: 'Al Arabiya', credibility: 'reliable' },
];

const sudanEvents: ConflictEvent[] = [
  { id: 'evt-sd-001', timestamp: '2026-03-07T14:00:00Z', type: 'ground_operation', title: 'RSF offensive on Khartoum suburbs', description: 'Rapid Support Forces launch offensive in southern Khartoum. Intense urban fighting.', location: { lat: 15.59, lng: 32.53, name: 'Khartoum, Sudan' }, source: 'Sudan Tribune', credibility: 'reliable' },
  { id: 'evt-sd-002', timestamp: '2026-03-07T12:00:00Z', type: 'humanitarian', title: 'UNHCR reports 500,000 displaced from El Fasher', description: 'Mass displacement from North Darfur capital. Refugee camps overwhelmed.', location: { lat: 13.63, lng: 25.35, name: 'El Fasher, Darfur' }, source: 'UNHCR', credibility: 'verified' },
  { id: 'evt-sd-003', timestamp: '2026-03-07T10:30:00Z', type: 'airstrike', title: 'SAF airstrikes hit RSF positions in Nyala', description: 'Sudanese Air Force conducts multiple bombing runs. Civilian casualties reported.', location: { lat: 12.05, lng: 24.88, name: 'Nyala, South Darfur' }, source: 'ACLED', credibility: 'reliable', casualties: { reported: 15, verified: false } },
  { id: 'evt-sd-004', timestamp: '2026-03-07T09:00:00Z', type: 'diplomatic', title: 'AU mediators arrive in Port Sudan for talks', description: 'African Union envoys begin shuttle diplomacy between SAF and RSF representatives.', location: { lat: 19.62, lng: 37.22, name: 'Port Sudan, Sudan' }, source: 'AU', credibility: 'verified' },
  { id: 'evt-sd-005', timestamp: '2026-03-07T07:30:00Z', type: 'humanitarian', title: 'MSF hospital in Darfur forced to close', description: 'Last functioning hospital in West Darfur shuts down after looting and threats.', location: { lat: 13.45, lng: 22.45, name: 'El Geneina, Darfur' }, source: 'MSF', credibility: 'verified' },
];

const myanmarEvents: ConflictEvent[] = [
  { id: 'evt-mm-001', timestamp: '2026-03-07T13:00:00Z', type: 'ground_operation', title: 'Resistance forces capture junta outpost in Shan State', description: 'Combined ethnic armed groups overrun military position near Lashio.', location: { lat: 22.93, lng: 97.75, name: 'Lashio, Shan State' }, source: 'Irrawaddy', credibility: 'reliable' },
  { id: 'evt-mm-002', timestamp: '2026-03-07T11:00:00Z', type: 'airstrike', title: 'Junta airstrikes on Sagaing villages', description: 'Military jets bomb resistance-held villages. At least 3 villages destroyed.', location: { lat: 21.88, lng: 95.97, name: 'Sagaing, Myanmar' }, source: 'Myanmar Now', credibility: 'reliable', casualties: { reported: 20, verified: false } },
  { id: 'evt-mm-003', timestamp: '2026-03-07T09:30:00Z', type: 'humanitarian', title: 'ICRC unable to access displaced populations in Rakhine', description: '200,000 displaced in Rakhine state with no humanitarian access for 3 weeks.', location: { lat: 20.15, lng: 92.90, name: 'Sittwe, Rakhine' }, source: 'ICRC', credibility: 'verified' },
  { id: 'evt-mm-004', timestamp: '2026-03-07T08:00:00Z', type: 'ground_operation', title: 'KNLA advances along Thai border region', description: 'Karen resistance fighters push junta forces from key border crossing.', location: { lat: 16.70, lng: 98.60, name: 'Myawaddy, Karen State' }, source: 'Karen News', credibility: 'reliable' },
  { id: 'evt-mm-005', timestamp: '2026-03-07T06:30:00Z', type: 'diplomatic', title: 'ASEAN calls emergency meeting on Myanmar crisis', description: 'Southeast Asian bloc convenes special session. Indonesia proposes new mediation plan.', location: { lat: 19.76, lng: 96.07, name: 'Naypyidaw, Myanmar' }, source: 'Reuters', credibility: 'verified' },
];

// ── Per-conflict mock news ──────────────────────────────────────────
const iranIsraelNews: NewsItem[] = [
  { id: 'n-ii-1', headline: 'UN chief calls for immediate ceasefire across all fronts', source: 'Reuters', credibility: 'verified', timestamp: '2026-03-07T14:50:00Z', url: '#' },
  { id: 'n-ii-2', headline: 'Red Cross unable to access northern Gaza for 5th day', source: 'ICRC', credibility: 'verified', timestamp: '2026-03-07T14:30:00Z', url: '#' },
  { id: 'n-ii-3', headline: 'Iranian FM denies involvement in Iraqi base attack', source: 'Press TV', credibility: 'unconfirmed', timestamp: '2026-03-07T14:10:00Z', url: '#' },
  { id: 'n-ii-4', headline: 'Egypt closes Rafah crossing amid security concerns', source: 'Al Arabiya', credibility: 'reliable', timestamp: '2026-03-07T13:45:00Z', url: '#' },
  { id: 'n-ii-5', headline: 'US deploying additional carrier group to Eastern Mediterranean', source: 'AP News', credibility: 'verified', timestamp: '2026-03-07T13:20:00Z', url: '#' },
  { id: 'n-ii-6', headline: 'WHO warns of disease outbreak risk in displaced populations', source: 'WHO', credibility: 'verified', timestamp: '2026-03-07T12:55:00Z', url: '#' },
  { id: 'n-ii-7', headline: 'Satellite imagery reveals new activity at Iranian nuclear facility', source: 'Planet Labs', credibility: 'reliable', timestamp: '2026-03-07T12:30:00Z', url: '#' },
  { id: 'n-ii-8', headline: 'Jordan intercepts unauthorized drone entering airspace', source: 'Petra News', credibility: 'reliable', timestamp: '2026-03-07T11:00:00Z', url: '#' },
];

const ukraineRussiaNews: NewsItem[] = [
  { id: 'n-ur-1', headline: 'Russian missile strike kills 10 in Kharkiv residential area', source: 'Ukrinform', credibility: 'verified', timestamp: '2026-03-07T14:00:00Z', url: '#' },
  { id: 'n-ur-2', headline: 'Trump says hatred between countries complicating peace deal', source: 'AP News', credibility: 'verified', timestamp: '2026-03-07T13:30:00Z', url: '#' },
  { id: 'n-ur-3', headline: 'Ukraine drone strike hits Russian oil depot in Kursk', source: 'Kyiv Independent', credibility: 'reliable', timestamp: '2026-03-07T12:00:00Z', url: '#' },
  { id: 'n-ur-4', headline: 'NATO members pledge additional air defense systems', source: 'Reuters', credibility: 'verified', timestamp: '2026-03-07T11:00:00Z', url: '#' },
  { id: 'n-ur-5', headline: 'Zaporizhzhia nuclear plant loses external power again', source: 'IAEA', credibility: 'verified', timestamp: '2026-03-07T10:00:00Z', url: '#' },
  { id: 'n-ur-6', headline: 'EU extends Russia sanctions for another 6 months', source: 'BBC', credibility: 'verified', timestamp: '2026-03-07T09:00:00Z', url: '#' },
  { id: 'n-ur-7', headline: 'Wagner Group remnants active in Belarus border region', source: 'ISW', credibility: 'reliable', timestamp: '2026-03-07T08:00:00Z', url: '#' },
  { id: 'n-ur-8', headline: 'Black Sea grain corridor negotiations stall', source: 'Al Jazeera', credibility: 'reliable', timestamp: '2026-03-07T07:00:00Z', url: '#' },
];

const yemenRedSeaNews: NewsItem[] = [
  { id: 'n-yr-1', headline: 'Houthi missile narrowly misses commercial tanker in Red Sea', source: 'CENTCOM', credibility: 'verified', timestamp: '2026-03-07T14:00:00Z', url: '#' },
  { id: 'n-yr-2', headline: 'Global shipping costs surge 300% due to Red Sea crisis', source: "Lloyd's List", credibility: 'verified', timestamp: '2026-03-07T13:00:00Z', url: '#' },
  { id: 'n-yr-3', headline: 'US/UK forces conduct new round of strikes on Yemen', source: 'UK MoD', credibility: 'verified', timestamp: '2026-03-07T12:00:00Z', url: '#' },
  { id: 'n-yr-4', headline: 'WFP warns 3.5 million at risk of famine in Yemen', source: 'WFP', credibility: 'verified', timestamp: '2026-03-07T11:00:00Z', url: '#' },
  { id: 'n-yr-5', headline: 'Saudi Arabia intercepts Houthi drone swarm near Jizan', source: 'SPA', credibility: 'reliable', timestamp: '2026-03-07T10:00:00Z', url: '#' },
  { id: 'n-yr-6', headline: 'Maersk suspends all Red Sea transits indefinitely', source: 'Reuters', credibility: 'verified', timestamp: '2026-03-07T09:00:00Z', url: '#' },
];

const sudanNews: NewsItem[] = [
  { id: 'n-sd-1', headline: 'RSF launches major offensive on Khartoum suburbs', source: 'Sudan Tribune', credibility: 'reliable', timestamp: '2026-03-07T14:00:00Z', url: '#' },
  { id: 'n-sd-2', headline: 'UNHCR reports 500,000 displaced from El Fasher in Darfur', source: 'UNHCR', credibility: 'verified', timestamp: '2026-03-07T13:00:00Z', url: '#' },
  { id: 'n-sd-3', headline: 'MSF forced to close last hospital in West Darfur', source: 'MSF', credibility: 'verified', timestamp: '2026-03-07T12:00:00Z', url: '#' },
  { id: 'n-sd-4', headline: 'African Union mediators arrive in Port Sudan', source: 'AU', credibility: 'verified', timestamp: '2026-03-07T11:00:00Z', url: '#' },
  { id: 'n-sd-5', headline: 'UN warns of ethnic cleansing in Darfur region', source: 'UN OHCHR', credibility: 'verified', timestamp: '2026-03-07T10:00:00Z', url: '#' },
  { id: 'n-sd-6', headline: 'Sudan telecommunications infrastructure collapses', source: 'NetBlocks', credibility: 'reliable', timestamp: '2026-03-07T09:00:00Z', url: '#' },
];

const myanmarNews: NewsItem[] = [
  { id: 'n-mm-1', headline: 'Resistance forces capture major junta outpost in Shan State', source: 'Irrawaddy', credibility: 'reliable', timestamp: '2026-03-07T14:00:00Z', url: '#' },
  { id: 'n-mm-2', headline: 'Junta airstrikes destroy 3 villages in Sagaing', source: 'Myanmar Now', credibility: 'reliable', timestamp: '2026-03-07T13:00:00Z', url: '#' },
  { id: 'n-mm-3', headline: 'ICRC blocked from accessing 200,000 displaced in Rakhine', source: 'ICRC', credibility: 'verified', timestamp: '2026-03-07T12:00:00Z', url: '#' },
  { id: 'n-mm-4', headline: 'ASEAN calls emergency meeting on Myanmar crisis', source: 'Reuters', credibility: 'verified', timestamp: '2026-03-07T11:00:00Z', url: '#' },
  { id: 'n-mm-5', headline: 'Karen resistance forces advance along Thai border', source: 'Karen News', credibility: 'reliable', timestamp: '2026-03-07T10:00:00Z', url: '#' },
  { id: 'n-mm-6', headline: 'UN special envoy warns of humanitarian catastrophe', source: 'UN', credibility: 'verified', timestamp: '2026-03-07T09:00:00Z', url: '#' },
];

// ── Lookup maps ─────────────────────────────────────────────────────
export const MOCK_EVENTS_BY_CONFLICT: Record<string, ConflictEvent[]> = {
  'iran-israel': iranIsraelEvents,
  'ukraine-russia': ukraineRussiaEvents,
  'yemen-red-sea': yemenRedSeaEvents,
  'sudan': sudanEvents,
  'myanmar': myanmarEvents,
};

export const MOCK_NEWS_BY_CONFLICT: Record<string, NewsItem[]> = {
  'iran-israel': iranIsraelNews,
  'ukraine-russia': ukraineRussiaNews,
  'yemen-red-sea': yemenRedSeaNews,
  'sudan': sudanNews,
  'myanmar': myanmarNews,
};

// Default exports (for backward compat)
export const mockEvents = iranIsraelEvents;
export const mockNews = iranIsraelNews;

export const mockStats: HumanitarianStat[] = [
  { label: 'Displaced Persons', value: '2.3M', change: '+120K', trend: 'up', source: 'UNHCR', lastUpdated: '2026-03-07' },
  { label: 'Aid Trucks (Weekly)', value: '87', change: '-34', trend: 'down', source: 'OCHA', lastUpdated: '2026-03-07' },
  { label: 'Active Conflict Zones', value: '14', change: '+2', trend: 'up', source: 'ACLED', lastUpdated: '2026-03-07' },
  { label: 'Ceasefire Violations', value: '47', change: '+12', trend: 'up', source: 'UN Monitors', lastUpdated: '2026-03-07' },
  { label: 'Hospitals Operational', value: '11/36', change: '-2', trend: 'down', source: 'WHO', lastUpdated: '2026-03-07' },
  { label: 'Internet Blackouts', value: '3', change: '+1', trend: 'up', source: 'NetBlocks', lastUpdated: '2026-03-07' },
  { label: 'Civilian Casualties (7d)', value: '342', change: '+58', trend: 'up', source: 'OCHA', lastUpdated: '2026-03-07' },
  { label: 'Shelters at Capacity', value: '89%', change: '+7%', trend: 'up', source: 'UNRWA', lastUpdated: '2026-03-07' },
  { label: 'Water Access', value: '23%', change: '-5%', trend: 'down', source: 'UNICEF', lastUpdated: '2026-03-07' },
  { label: 'Schools Closed', value: '247', change: '+18', trend: 'up', source: 'UNESCO', lastUpdated: '2026-03-07' },
  { label: 'Press Freedom Index', value: 'CRITICAL', change: '-3pts', trend: 'down', source: 'RSF', lastUpdated: '2026-03-07' },
  { label: 'Drone Incidents (24h)', value: '19', change: '+4', trend: 'up', source: 'ADS-B Exchange', lastUpdated: '2026-03-07' },
];
