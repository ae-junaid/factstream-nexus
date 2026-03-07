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

export const mockEvents: ConflictEvent[] = [
  {
    id: 'evt-001',
    timestamp: '2026-03-07T14:32:00Z',
    type: 'airstrike',
    title: 'Airstrikes reported in southern Lebanon',
    description: 'Multiple airstrikes reported in the Nabatieh governorate. Local sources report impacts on infrastructure. No official confirmation of targets.',
    location: { lat: 33.3779, lng: 35.4839, name: 'Nabatieh, Lebanon' },
    source: 'Reuters',
    credibility: 'verified',
    casualties: { reported: 0, verified: false },
  },
  {
    id: 'evt-002',
    timestamp: '2026-03-07T13:15:00Z',
    type: 'rocket_attack',
    title: 'Rocket barrage toward northern Israel',
    description: 'Approximately 30 rockets launched from southern Lebanon toward the Galilee region. Iron Dome interceptions reported. Sirens activated in Kiryat Shmona.',
    location: { lat: 33.2072, lng: 35.5689, name: 'Kiryat Shmona, Israel' },
    source: 'AP News',
    credibility: 'verified',
  },
  {
    id: 'evt-003',
    timestamp: '2026-03-07T12:45:00Z',
    type: 'ground_operation',
    title: 'Military operations in Rafah corridor',
    description: 'IDF announces ongoing operations in the Rafah border area. Palestinian sources report tank movements and demolitions near the Egyptian border.',
    location: { lat: 31.2969, lng: 34.2478, name: 'Rafah, Gaza' },
    source: 'Al Jazeera',
    credibility: 'reliable',
    casualties: { reported: 12, verified: false },
  },
  {
    id: 'evt-004',
    timestamp: '2026-03-07T11:00:00Z',
    type: 'diplomatic',
    title: 'UN Security Council emergency session called',
    description: 'France and UK push for emergency UNSC session regarding escalating regional tensions. US position remains unclear.',
    location: { lat: 40.7489, lng: -73.968, name: 'UN HQ, New York' },
    source: 'BBC',
    credibility: 'verified',
  },
  {
    id: 'evt-005',
    timestamp: '2026-03-07T10:30:00Z',
    type: 'humanitarian',
    title: 'UNRWA aid convoy reaches Khan Younis',
    description: 'First aid delivery in 72 hours reaches southern Gaza. UNRWA reports critical shortages of medical supplies and clean water persist.',
    location: { lat: 31.3462, lng: 34.3064, name: 'Khan Younis, Gaza' },
    source: 'OCHA',
    credibility: 'verified',
  },
  {
    id: 'evt-006',
    timestamp: '2026-03-07T09:20:00Z',
    type: 'naval',
    title: 'Houthi drone intercept in Red Sea',
    description: 'US Navy destroyer intercepts drone launched from Yemen toward commercial shipping lane. No damage to vessels reported.',
    location: { lat: 14.5, lng: 42.5, name: 'Red Sea, off Yemen coast' },
    source: 'CENTCOM',
    credibility: 'verified',
  },
  {
    id: 'evt-007',
    timestamp: '2026-03-07T08:00:00Z',
    type: 'airstrike',
    title: 'Strikes on suspected weapons depot in Syria',
    description: 'Unattributed airstrikes hit targets near Damascus. Syrian state media reports military casualties. No party claims responsibility.',
    location: { lat: 33.513, lng: 36.292, name: 'Damascus suburbs, Syria' },
    source: 'SANA / SOHR',
    credibility: 'unconfirmed',
    casualties: { reported: 5, verified: false },
  },
  {
    id: 'evt-008',
    timestamp: '2026-03-07T07:15:00Z',
    type: 'cyber',
    title: 'Cyberattack disrupts Iranian infrastructure',
    description: 'Reports of widespread internet disruption in multiple Iranian provinces. Attribution unclear. Iranian state media blames foreign actors.',
    location: { lat: 35.6892, lng: 51.389, name: 'Tehran, Iran' },
    source: 'NetBlocks',
    credibility: 'reliable',
  },
  {
    id: 'evt-009',
    timestamp: '2026-03-07T06:45:00Z',
    type: 'ground_operation',
    title: 'IDF announces withdrawal from Jenin',
    description: 'Israeli forces complete 48-hour operation in Jenin refugee camp. Palestinian Health Ministry reports 8 fatalities during the operation.',
    location: { lat: 32.4607, lng: 35.2946, name: 'Jenin, West Bank' },
    source: 'Times of Israel / Wafa',
    credibility: 'reliable',
    casualties: { reported: 8, verified: false },
  },
  {
    id: 'evt-010',
    timestamp: '2026-03-07T05:00:00Z',
    type: 'rocket_attack',
    title: 'Militia rockets hit US base in Iraq',
    description: 'At least 3 rockets strike Ain al-Asad airbase. Iran-aligned militia group claims responsibility. US reports no casualties.',
    location: { lat: 33.786, lng: 43.558, name: 'Ain al-Asad, Iraq' },
    source: 'Pentagon / Iraqi media',
    credibility: 'verified',
  },
];

export const mockNews: NewsItem[] = [
  { id: 'n1', headline: 'UN chief calls for immediate ceasefire across all fronts', source: 'Reuters', credibility: 'verified', timestamp: '2026-03-07T14:50:00Z', url: '#' },
  { id: 'n2', headline: 'Red Cross reports inability to access northern Gaza for 5th consecutive day', source: 'ICRC', credibility: 'verified', timestamp: '2026-03-07T14:30:00Z', url: '#' },
  { id: 'n3', headline: 'Iranian foreign minister denies involvement in Iraqi base attack', source: 'Press TV', credibility: 'unconfirmed', timestamp: '2026-03-07T14:10:00Z', url: '#' },
  { id: 'n4', headline: 'Egypt closes Rafah crossing amid security concerns', source: 'Al Arabiya', credibility: 'reliable', timestamp: '2026-03-07T13:45:00Z', url: '#' },
  { id: 'n5', headline: 'US deploying additional carrier group to Eastern Mediterranean', source: 'AP News', credibility: 'verified', timestamp: '2026-03-07T13:20:00Z', url: '#' },
  { id: 'n6', headline: 'WHO warns of disease outbreak risk in displaced populations', source: 'WHO', credibility: 'verified', timestamp: '2026-03-07T12:55:00Z', url: '#' },
  { id: 'n7', headline: 'Satellite imagery reveals new construction at Iranian nuclear facility', source: 'Planet Labs', credibility: 'reliable', timestamp: '2026-03-07T12:30:00Z', url: '#' },
  { id: 'n8', headline: 'Turkish parliament debates military authorization for Syria operations', source: 'BBC', credibility: 'verified', timestamp: '2026-03-07T12:00:00Z', url: '#' },
  { id: 'n9', headline: 'Civilian casualties in Lebanon exceed 200 this week — local health ministry', source: 'LBC', credibility: 'unconfirmed', timestamp: '2026-03-07T11:30:00Z', url: '#' },
  { id: 'n10', headline: 'Jordan intercepts unauthorized drone entering airspace', source: 'Petra News', credibility: 'reliable', timestamp: '2026-03-07T11:00:00Z', url: '#' },
];

export const mockStats: HumanitarianStat[] = [
  { label: 'Displaced Persons', value: '2.3M', change: '+120K', trend: 'up', source: 'UNHCR', lastUpdated: '2026-03-07' },
  { label: 'Aid Trucks (Weekly)', value: '87', change: '-34', trend: 'down', source: 'OCHA', lastUpdated: '2026-03-07' },
  { label: 'Active Conflict Zones', value: '14', change: '+2', trend: 'up', source: 'ACLED', lastUpdated: '2026-03-07' },
  { label: 'Ceasefire Violations', value: '47', change: '+12', trend: 'up', source: 'UN Monitors', lastUpdated: '2026-03-07' },
  { label: 'Hospitals Operational', value: '11/36', change: '-2', trend: 'down', source: 'WHO', lastUpdated: '2026-03-07' },
  { label: 'Internet Blackouts', value: '3', change: '+1', trend: 'up', source: 'NetBlocks', lastUpdated: '2026-03-07' },
];
