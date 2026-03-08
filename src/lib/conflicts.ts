export interface ConflictZone {
  id: string;
  label: string;
  shortLabel: string;
  gdeltQuery: string;
  center: [number, number];
  zoom: number;
  bbox: { lamin: number; lomin: number; lamax: number; lomax: number };
  regions: string[];
  parties: string[];
}

export const CONFLICT_ZONES: ConflictZone[] = [
  {
    id: 'iran-israel',
    label: 'Iran — Israel / Middle East',
    shortLabel: 'IRAN-ISRAEL',
    gdeltQuery: '(Iran OR Israel OR Gaza OR Hezbollah OR Hamas OR "West Bank" OR Lebanon OR "Red Sea" OR Houthi OR Syria) (war OR attack OR strike OR military OR conflict OR ceasefire OR missile OR drone) sourcelang:english',
    center: [31, 38],
    zoom: 5,
    bbox: { lamin: 12, lomin: 30, lamax: 40, lomax: 60 },
    regions: ['Israel', 'Iran', 'Gaza', 'Lebanon', 'Syria', 'Iraq', 'Yemen', 'Red Sea'],
    parties: ['Israel', 'Iran', 'Hamas', 'Hezbollah', 'Houthis', 'IRGC'],
  },
  {
    id: 'ukraine-russia',
    label: 'Ukraine — Russia',
    shortLabel: 'UKRAINE-RUSSIA',
    gdeltQuery: '(Ukraine OR Russia OR Kyiv OR Crimea OR Donbas OR Kharkiv OR Zaporizhzhia OR Bakhmut) (war OR attack OR military OR conflict OR offensive OR missile OR drone OR front)',
    center: [49, 33],
    zoom: 5,
    bbox: { lamin: 44, lomin: 22, lamax: 56, lomax: 42 },
    regions: ['Ukraine', 'Russia', 'Crimea', 'Donbas', 'Belarus'],
    parties: ['Ukraine', 'Russia', 'NATO'],
  },
  {
    id: 'yemen-red-sea',
    label: 'Yemen — Red Sea / Houthi',
    shortLabel: 'YEMEN-RED SEA',
    gdeltQuery: '(Yemen OR Houthi OR "Red Sea" OR "Bab el-Mandeb" OR Aden OR Sanaa) (attack OR missile OR ship OR naval OR strike OR military)',
    center: [15, 44],
    zoom: 6,
    bbox: { lamin: 10, lomin: 38, lamax: 20, lomax: 55 },
    regions: ['Yemen', 'Red Sea', 'Gulf of Aden', 'Saudi Arabia'],
    parties: ['Houthis', 'Saudi Arabia', 'US Navy', 'UK Navy'],
  },
  {
    id: 'sudan',
    label: 'Sudan Civil War',
    shortLabel: 'SUDAN',
    gdeltQuery: '(Sudan OR Khartoum OR RSF OR Darfur OR "Rapid Support Forces") (war OR conflict OR attack OR military OR humanitarian OR displacement)',
    center: [15, 30],
    zoom: 5,
    bbox: { lamin: 8, lomin: 22, lamax: 23, lomax: 40 },
    regions: ['Sudan', 'Khartoum', 'Darfur', 'South Sudan'],
    parties: ['SAF', 'RSF', 'AU'],
  },
  {
    id: 'myanmar',
    label: 'Myanmar Civil War',
    shortLabel: 'MYANMAR',
    gdeltQuery: '(Myanmar OR Burma OR Yangon OR "resistance forces" OR junta) (conflict OR attack OR military OR coup OR resistance)',
    center: [19, 96],
    zoom: 5,
    bbox: { lamin: 9, lomin: 92, lamax: 28, lomax: 102 },
    regions: ['Myanmar', 'Yangon', 'Mandalay', 'Rakhine'],
    parties: ['Military Junta', 'NUG', 'Ethnic Armed Organizations'],
  },
];

export const DEFAULT_CONFLICT = CONFLICT_ZONES[0];
