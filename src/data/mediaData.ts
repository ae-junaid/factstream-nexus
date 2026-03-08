export type MediaCredibility = 'verified' | 'reliable' | 'unconfirmed' | 'disputed';

export interface WarMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  caption: string;
  source: string;
  platform: string;
  credibility: MediaCredibility;
  timestamp: string;
  location?: string;
}

export const mockWarMedia: WarMedia[] = [
  {
    id: 'wm-001',
    type: 'image',
    url: '#',
    thumbnail: 'https://images.unsplash.com/photo-1590081543655-f3c3c1a56d73?w=600&h=340&fit=crop',
    caption: 'Satellite imagery shows damage to infrastructure in northern Gaza strip',
    source: '@PlanetLabs',
    platform: 'X',
    credibility: 'verified',
    timestamp: '2026-03-07T14:20:00Z',
    location: 'Northern Gaza',
  },
  {
    id: 'wm-002',
    type: 'video',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=340&fit=crop',
    caption: 'Iron Dome intercepts multiple rocket barrage over southern Israel — CCTV footage',
    source: '@IsraelRadar',
    platform: 'Telegram',
    credibility: 'verified',
    timestamp: '2026-03-07T13:10:00Z',
    location: 'Southern Israel',
  },
  {
    id: 'wm-003',
    type: 'image',
    url: '#',
    thumbnail: 'https://images.unsplash.com/photo-1580130379624-3a069adbffc5?w=600&h=340&fit=crop',
    caption: 'USS Eisenhower carrier group repositioning in Eastern Mediterranean',
    source: '@ABORON_1',
    platform: 'X',
    credibility: 'reliable',
    timestamp: '2026-03-07T10:30:00Z',
    location: 'Eastern Mediterranean',
  },
  {
    id: 'wm-004',
    type: 'video',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=600&h=340&fit=crop',
    caption: 'Houthi anti-ship missile launch captured on camera — Red Sea',
    source: '@YemenUpdate',
    platform: 'Telegram',
    credibility: 'unconfirmed',
    timestamp: '2026-03-07T09:45:00Z',
    location: 'Red Sea',
  },
  {
    id: 'wm-005',
    type: 'video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=340&fit=crop',
    caption: 'Cruise missile impact footage — southern Beirut suburbs overnight strike',
    source: '@LBCINews',
    platform: 'X',
    credibility: 'reliable',
    timestamp: '2026-03-07T08:15:00Z',
    location: 'Beirut, Lebanon',
  },
  {
    id: 'wm-006',
    type: 'image',
    url: '#',
    thumbnail: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=340&fit=crop',
    caption: 'UNRWA convoy delivering aid reaches Khan Younis — first delivery in 72 hours',
    source: '@UNRWA',
    platform: 'X',
    credibility: 'verified',
    timestamp: '2026-03-07T07:00:00Z',
    location: 'Khan Younis, Gaza',
  },
  {
    id: 'wm-007',
    type: 'video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1590081543655-f3c3c1a56d73?w=600&h=340&fit=crop',
    caption: 'Drone footage shows ballistic missile intercepted over Riyadh — Saudi MoD',
    source: '@SaudiMoD',
    platform: 'X',
    credibility: 'verified',
    timestamp: '2026-03-07T05:30:00Z',
    location: 'Riyadh, Saudi Arabia',
  },
];
