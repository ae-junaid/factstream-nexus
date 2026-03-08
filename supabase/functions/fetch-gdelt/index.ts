const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ok = (data: unknown) => new Response(
  JSON.stringify({ success: true, data }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function tryFetch(url: string, timeoutMs = 10000): Promise<Response | null> {
  try {
    const response = await fetchWithTimeout(url, timeoutMs);
    if (response.ok) return response;
    console.warn(`HTTP ${response.status} for ${url.substring(0, 80)}`);
    return null;
  } catch (err) {
    console.warn(`Fetch error: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

function extractDomainFromUrl(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return 'unknown'; }
}

function simplifyQuery(query: string): string {
  return query.replace(/sourcelang:\w+/g, '').replace(/\s+/g, ' ').trim();
}

function extractKeyTerms(query: string): string {
  return query
    .replace(/sourcelang:\w+/g, '')
    .replace(/[()]/g, '')
    .split(/\s+OR\s+/i)
    .filter(k => !k.match(/^(war|attack|military|conflict|strike|missile|drone|bombing)$/i))
    .slice(0, 3)
    .map(k => k.replace(/"/g, '').trim())
    .filter(Boolean)
    .join(' ');
}

// Reliable topic images from Unsplash (no API key needed)
const TOPIC_IMAGES: Record<string, string[]> = {
  iran: [
    'https://images.unsplash.com/photo-1564694202883-46e7fa827764?w=800&q=80',
    'https://images.unsplash.com/photo-1547483238-2cbf881a559f?w=800&q=80',
  ],
  israel: [
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
    'https://images.unsplash.com/photo-1552423314-cf29ab68ad73?w=800&q=80',
  ],
  ukraine: [
    'https://images.unsplash.com/photo-1561542320-9a18cd340e98?w=800&q=80',
    'https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?w=800&q=80',
  ],
  military: [
    'https://images.unsplash.com/photo-1580752300992-559f8e0734e0?w=800&q=80',
    'https://images.unsplash.com/photo-1579912437766-7896df6d3cd3?w=800&q=80',
  ],
  diplomatic: [
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80',
  ],
  humanitarian: [
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
  ],
};

function getTopicImage(title: string, index: number): string {
  const t = title.toLowerCase();
  let pool = TOPIC_IMAGES.default;
  if (t.includes('iran') || t.includes('tehran') || t.includes('persian')) pool = TOPIC_IMAGES.iran;
  else if (t.includes('israel') || t.includes('jerusalem')) pool = TOPIC_IMAGES.israel;
  else if (t.includes('ukraine') || t.includes('kyiv')) pool = TOPIC_IMAGES.ukraine;
  else if (t.includes('diplomatic') || t.includes('talks') || t.includes('summit')) pool = TOPIC_IMAGES.diplomatic;
  else if (t.includes('humanitarian') || t.includes('aid') || t.includes('refugee')) pool = TOPIC_IMAGES.humanitarian;
  else if (t.includes('military') || t.includes('strike') || t.includes('missile') || t.includes('war')) pool = TOPIC_IMAGES.military;
  return pool[index % pool.length];
}

function enrichWithImages(articles: any[]): any[] {
  return articles.map((a: any, i: number) => {
    if (a.socialimage && a.socialimage.startsWith('http')) return a;
    return { ...a, socialimage: getTopicImage(a.title || '', i) };
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, mode } = await req.json();

    if (!query) {
      return ok(mode === 'geo' ? { type: 'FeatureCollection', features: [] } : { articles: [] });
    }

    const cleanQuery = simplifyQuery(query);
    const encodedQuery = encodeURIComponent(cleanQuery + ' sourcelang:english');

    if (mode === 'geo') {
      for (const timespan of ['1h', '3h', '12h']) {
        const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=${encodedQuery}&mode=PointData&format=GeoJSON&timespan=${timespan}&maxpoints=50`;
        console.log(`GDELT GEO timespan=${timespan}`);
        const response = await tryFetch(url, 12000);
        if (!response) continue;
        try {
          const data = await response.json();
          if (data?.features?.length > 0) {
            console.log(`GEO success: ${data.features.length} features (${timespan})`);
            return ok(data);
          }
        } catch { /* continue */ }
      }

      const docUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodedQuery}&mode=artlist&maxrecords=30&format=json&sort=DateDesc&timespan=24h`;
      const docResponse = await tryFetch(docUrl, 12000);
      if (docResponse) {
        try {
          const data = await docResponse.json();
          const articles = (data?.articles || []).filter((a: any) => !a.language || a.language === 'English');
          const features = articles.slice(0, 25).map((a: any) => {
            const loc = extractLocationFromArticle(a.title || '');
            return {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [loc.lng, loc.lat] },
              properties: { name: a.title || 'Unknown event', url: a.url || '', urlpubtimedate: a.seendate || new Date().toISOString(), html: a.title || '', domain: a.domain || '' },
            };
          }).filter((f: any) => f.geometry.coordinates[0] !== 0 && f.geometry.coordinates[1] !== 0);
          if (features.length > 0) {
            console.log(`Doc-to-geo fallback: ${features.length} features`);
            return ok({ type: 'FeatureCollection', features });
          }
        } catch { /* continue */ }
      }
      return ok({ type: 'FeatureCollection', features: [] });
    }

    // === ARTICLE MODE ===
    for (const timespan of ['1h', '3h', '6h', '24h']) {
      const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodedQuery}&mode=artlist&maxrecords=40&format=json&sort=DateDesc&timespan=${timespan}`;
      console.log(`GDELT articles timespan=${timespan}`);
      const response = await tryFetch(url, 12000);
      if (!response) continue;
      try {
        const data = await response.json();
        const articles = (data?.articles || []).filter((a: any) => !a.language || a.language === 'English');
        if (articles.length > 0) {
          console.log(`GDELT articles: ${articles.length} (${timespan})`);
          return ok({ articles: enrichWithImages(articles) });
        }
      } catch { /* continue */ }
    }

    // Fallback: Google News RSS via rss2json
    const keywords = extractKeyTerms(query);
    console.log(`RSS fallback for: ${keywords}`);
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keywords)}&hl=en&gl=US&ceid=US:en`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=25`;
    const rssResponse = await tryFetch(apiUrl, 8000);
    if (rssResponse) {
      try {
        const data = await rssResponse.json();
        if (data.status === 'ok' && data.items?.length) {
          const articles = data.items.map((item: any) => ({
            url: item.link || '', title: (item.title || '').replace(/<[^>]*>/g, '').trim(),
            seendate: item.pubDate || new Date().toISOString(),
            socialimage: item.thumbnail || item.enclosure?.link || '',
            domain: extractDomainFromUrl(item.link || ''), language: 'English', sourcecountry: '',
          })).filter((a: any) => a.title && a.url);
          if (articles.length > 0) {
            console.log(`RSS: ${articles.length} articles`);
            return ok({ articles: enrichWithImages(articles) });
          }
        }
      } catch { /* continue */ }
    }

    // Fallback 2: Google News Atom feed
    const atomUrl = `https://news.google.com/atom/search?q=${encodeURIComponent(keywords)}&hl=en&gl=US`;
    const atomResponse = await tryFetch(atomUrl, 8000);
    if (atomResponse) {
      try {
        const text = await atomResponse.text();
        const entries = text.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
        const articles = entries.slice(0, 20).map((entry: string) => {
          const titleMatch = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/);
          const linkMatch = entry.match(/<link[^>]*href="([^"]*)"[^>]*\/>/);
          const updatedMatch = entry.match(/<updated>([\s\S]*?)<\/updated>/);
          const sourceMatch = entry.match(/<source[^>]*><title[^>]*>([\s\S]*?)<\/title>/);
          return {
            url: linkMatch?.[1] || '',
            title: (titleMatch?.[1] || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim(),
            seendate: updatedMatch?.[1] || new Date().toISOString(),
            socialimage: '',
            domain: sourceMatch?.[1]?.trim() || extractDomainFromUrl(linkMatch?.[1] || ''),
            language: 'English', sourcecountry: '',
          };
        }).filter((a: any) => a.title && a.url);
        if (articles.length > 0) {
          console.log(`Atom: ${articles.length} articles`);
          return ok({ articles: enrichWithImages(articles) });
        }
      } catch { /* continue */ }
    }

    console.log('All sources returned 0 articles');
    return ok({ articles: [] });
  } catch (error) {
    console.error('Edge function error:', error);
    return ok({ articles: [] });
  }
});

function extractLocationFromArticle(title: string): { lat: number; lng: number } {
  const t = title.toLowerCase();
  const locations: Record<string, { lat: number; lng: number }> = {
    'gaza': { lat: 31.35, lng: 34.31 }, 'rafah': { lat: 31.30, lng: 34.25 },
    'tel aviv': { lat: 32.09, lng: 34.78 }, 'jerusalem': { lat: 31.77, lng: 35.23 },
    'beirut': { lat: 33.89, lng: 35.50 }, 'lebanon': { lat: 33.85, lng: 35.86 },
    'damascus': { lat: 33.51, lng: 36.29 }, 'syria': { lat: 34.80, lng: 38.99 },
    'tehran': { lat: 35.69, lng: 51.39 }, 'iran': { lat: 32.43, lng: 53.69 },
    'isfahan': { lat: 32.65, lng: 51.68 }, 'iraq': { lat: 33.22, lng: 43.68 },
    'baghdad': { lat: 33.31, lng: 44.37 }, 'yemen': { lat: 15.55, lng: 48.52 },
    'sanaa': { lat: 15.37, lng: 44.19 }, 'red sea': { lat: 20.00, lng: 38.50 },
    'hormuz': { lat: 26.60, lng: 56.25 }, 'houthi': { lat: 15.35, lng: 44.21 },
    'israel': { lat: 31.05, lng: 34.85 }, 'west bank': { lat: 31.95, lng: 35.25 },
    'hezbollah': { lat: 33.27, lng: 35.20 }, 'qatar': { lat: 25.29, lng: 51.53 },
    'al udeid': { lat: 25.12, lng: 51.31 }, 'dubai': { lat: 25.20, lng: 55.27 },
    'uae': { lat: 24.45, lng: 54.65 }, 'bahrain': { lat: 26.07, lng: 50.55 },
    'oman': { lat: 23.58, lng: 58.38 }, 'riyadh': { lat: 24.71, lng: 46.67 },
    'saudi': { lat: 24.71, lng: 46.67 }, 'persian gulf': { lat: 26.00, lng: 52.00 },
    'ukraine': { lat: 48.38, lng: 31.17 }, 'kyiv': { lat: 50.45, lng: 30.52 },
    'kharkiv': { lat: 49.99, lng: 36.23 }, 'crimea': { lat: 44.95, lng: 34.10 },
    'donbas': { lat: 48.02, lng: 37.80 }, 'russia': { lat: 55.75, lng: 37.62 },
    'moscow': { lat: 55.76, lng: 37.62 }, 'sudan': { lat: 15.50, lng: 32.56 },
    'khartoum': { lat: 15.59, lng: 32.53 }, 'darfur': { lat: 13.50, lng: 25.00 },
    'myanmar': { lat: 19.76, lng: 96.07 }, 'yangon': { lat: 16.87, lng: 96.20 },
  };
  for (const [keyword, coords] of Object.entries(locations)) {
    if (t.includes(keyword)) {
      return { lat: coords.lat + (Math.random() - 0.5) * 0.5, lng: coords.lng + (Math.random() - 0.5) * 0.5 };
    }
  }
  return { lat: 0, lng: 0 };
}
