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

async function fetchWithRetry(url: string, timeoutMs: number, retries = 2): Promise<Response | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetchWithTimeout(url, timeoutMs);
      if (response.ok) return response;
      console.warn(`Attempt ${i + 1} failed: HTTP ${response.status}`);
    } catch (err) {
      console.warn(`Attempt ${i + 1} error:`, err instanceof Error ? err.message : err);
    }
    if (i < retries) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  return null;
}

// RSS feed URLs per conflict for fallback news
const RSS_FEEDS: Record<string, string[]> = {
  'iran-israel': [
    'https://rss.app/feeds/v1.1/t4bNsGfbqeSnqOPH.json',
  ],
  'default': [],
};

// Fetch news from RSS via rss2json (free, no key)
async function fetchRssNews(query: string): Promise<any[]> {
  // Use Google News RSS as a universal fallback
  const keywords = query
    .replace(/sourcelang:\w+/g, '')
    .replace(/[()]/g, '')
    .split(/\s+OR\s+/i)
    .slice(0, 3)
    .map(k => k.replace(/"/g, '').trim())
    .filter(Boolean)
    .join('+');
  
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keywords)}&hl=en&gl=US&ceid=US:en`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=25`;
  
  console.log('Trying RSS fallback:', apiUrl.substring(0, 100));
  
  try {
    const response = await fetchWithTimeout(apiUrl, 8000);
    if (!response.ok) return [];
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.items?.length) return [];
    
    return data.items.map((item: any) => ({
      url: item.link || '',
      title: (item.title || '').replace(/<[^>]*>/g, '').trim(),
      seendate: item.pubDate || new Date().toISOString(),
      socialimage: item.thumbnail || item.enclosure?.link || '',
      domain: extractDomainFromUrl(item.link || ''),
      language: 'English',
      sourcecountry: '',
    })).filter((a: any) => a.title && a.url);
  } catch (err) {
    console.warn('RSS fallback failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

function extractDomainFromUrl(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return 'unknown'; }
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

    const langQuery = query.includes('sourcelang:') ? query : `${query} sourcelang:english`;
    const encodedQuery = encodeURIComponent(langQuery);

    if (mode === 'geo') {
      // Try GDELT GEO API with retry
      const geoModes = ['PointData', 'PointHeatmap'];
      
      for (const geoMode of geoModes) {
        const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=${encodedQuery}&mode=${geoMode}&format=GeoJSON&timespan=1h&maxpoints=50`;
        console.log('Trying GDELT GEO:', geoMode);

        const response = await fetchWithRetry(url, 12000, 1);
        if (!response) continue;

        try {
          const text = await response.text();
          const data = JSON.parse(text);
          const features = data?.features || [];
          if (features.length > 0) {
            console.log(`GDELT GEO ${geoMode}: ${features.length} features`);
            return ok(data);
          }
        } catch {
          console.warn('GDELT GEO parse error for mode', geoMode);
        }
      }

      // Fallback: use DOC API to generate geo from articles
      const docUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodedQuery}&mode=artlist&maxrecords=30&format=json&sort=DateDesc&timespan=72h`;
      const docResponse = await fetchWithRetry(docUrl, 12000, 1);
      
      if (docResponse) {
        try {
          const text = await docResponse.text();
          const data = JSON.parse(text);
          const articles = (data?.articles || []).filter((a: any) => a.language === 'English');
          const features = articles.slice(0, 25).map((a: any, i: number) => {
            const loc = extractLocationFromArticle(a.title || '', a.domain || '');
            return {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [loc.lng, loc.lat] },
              properties: {
                name: a.title || 'Unknown event',
                url: a.url || '',
                urlpubtimedate: a.seendate || new Date().toISOString(),
                html: a.title || '',
                domain: a.domain || '',
              },
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
    // Try GDELT first with retry
    const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodedQuery}&mode=artlist&maxrecords=40&format=json&sort=DateDesc&timespan=48h`;
    console.log('Fetching GDELT articles');

    const gdeltResponse = await fetchWithRetry(gdeltUrl, 12000, 2);
    
    if (gdeltResponse) {
      try {
        const text = await gdeltResponse.text();
        const data = JSON.parse(text);
        const articles = (data?.articles || []).filter((a: any) => 
          !a.language || a.language === 'English'
        );
        
        if (articles.length > 0) {
          console.log(`GDELT articles: ${articles.length}`);
          return ok({ articles });
        }
      } catch { /* fall through to RSS */ }
    }

    // Fallback: Google News RSS via rss2json
    console.log('GDELT returned 0 articles, trying RSS fallback');
    const rssArticles = await fetchRssNews(query);
    
    if (rssArticles.length > 0) {
      console.log(`RSS fallback: ${rssArticles.length} articles`);
      return ok({ articles: rssArticles });
    }

    console.log('All news sources returned 0 articles');
    return ok({ articles: [] });
  } catch (error) {
    console.error('Edge function error:', error);
    return ok({ articles: [] });
  }
});

function extractLocationFromArticle(title: string, _domain: string): { lat: number; lng: number } {
  const t = title.toLowerCase();
  const locations: Record<string, { lat: number; lng: number }> = {
    'gaza': { lat: 31.35, lng: 34.31 },
    'rafah': { lat: 31.30, lng: 34.25 },
    'khan younis': { lat: 31.35, lng: 34.31 },
    'tel aviv': { lat: 32.09, lng: 34.78 },
    'jerusalem': { lat: 31.77, lng: 35.23 },
    'beirut': { lat: 33.89, lng: 35.50 },
    'lebanon': { lat: 33.85, lng: 35.86 },
    'damascus': { lat: 33.51, lng: 36.29 },
    'syria': { lat: 34.80, lng: 38.99 },
    'tehran': { lat: 35.69, lng: 51.39 },
    'iran': { lat: 32.43, lng: 53.69 },
    'isfahan': { lat: 32.65, lng: 51.68 },
    'iraq': { lat: 33.22, lng: 43.68 },
    'baghdad': { lat: 33.31, lng: 44.37 },
    'yemen': { lat: 15.55, lng: 48.52 },
    'sanaa': { lat: 15.37, lng: 44.19 },
    'red sea': { lat: 20.00, lng: 38.50 },
    'hormuz': { lat: 26.60, lng: 56.25 },
    'houthi': { lat: 15.35, lng: 44.21 },
    'israel': { lat: 31.05, lng: 34.85 },
    'west bank': { lat: 31.95, lng: 35.25 },
    'jenin': { lat: 32.46, lng: 35.29 },
    'nablus': { lat: 32.22, lng: 35.26 },
    'hezbollah': { lat: 33.27, lng: 35.20 },
    'ukraine': { lat: 48.38, lng: 31.17 },
    'kyiv': { lat: 50.45, lng: 30.52 },
    'kharkiv': { lat: 49.99, lng: 36.23 },
    'crimea': { lat: 44.95, lng: 34.10 },
    'donbas': { lat: 48.02, lng: 37.80 },
    'russia': { lat: 55.75, lng: 37.62 },
    'moscow': { lat: 55.76, lng: 37.62 },
    'sudan': { lat: 15.50, lng: 32.56 },
    'khartoum': { lat: 15.59, lng: 32.53 },
    'darfur': { lat: 13.50, lng: 25.00 },
    'myanmar': { lat: 19.76, lng: 96.07 },
    'yangon': { lat: 16.87, lng: 96.20 },
  };

  for (const [keyword, coords] of Object.entries(locations)) {
    if (t.includes(keyword)) {
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.5,
        lng: coords.lng + (Math.random() - 0.5) * 0.5,
      };
    }
  }
  return { lat: 0, lng: 0 };
}
