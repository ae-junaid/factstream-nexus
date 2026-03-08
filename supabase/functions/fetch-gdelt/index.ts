const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ok = (data: unknown) => new Response(
  JSON.stringify({ success: true, data }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, mode } = await req.json();

    if (!query) {
      return ok(mode === 'geo' ? { type: 'FeatureCollection', features: [] } : { articles: [] });
    }

    // Always enforce English language
    const langQuery = query.includes('sourcelang:') ? query : `${query} sourcelang:english`;
    const encodedQuery = encodeURIComponent(langQuery);

    if (mode === 'geo') {
      // Try multiple GDELT GEO API modes - PointData often 404s
      const geoModes = ['PointData', 'PointHeatmap'];
      
      for (const geoMode of geoModes) {
        const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=${encodedQuery}&mode=${geoMode}&format=GeoJSON&timespan=7d&maxpoints=50`;
        console.log('Trying GDELT GEO:', geoMode, url.substring(0, 120));

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);

          if (!response.ok) {
            const text = await response.text();
            console.warn(`GDELT GEO ${geoMode} error:`, response.status, text.substring(0, 100));
            continue; // try next mode
          }

          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            console.warn('GDELT GEO parse error for mode', geoMode);
            continue;
          }

          const features = data?.features || [];
          if (features.length > 0) {
            console.log(`GDELT GEO ${geoMode}: ${features.length} features`);
            return ok(data);
          }
        } catch (fetchErr) {
          clearTimeout(timeout);
          console.warn(`GDELT GEO ${geoMode} fetch failed:`, fetchErr instanceof Error ? fetchErr.message : fetchErr);
        }
      }

      // Fallback: use DOC API to get articles with tone/location data
      const docUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodedQuery}&mode=artlist&maxrecords=30&format=json&sort=DateDesc&timespan=72h`;
      console.log('Falling back to DOC API for geo data');
      
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 10000);
      
      try {
        const response = await fetch(docUrl, { signal: controller2.signal });
        clearTimeout(timeout2);
        
        if (response.ok) {
          const text = await response.text();
          let data;
          try { data = JSON.parse(text); } catch { data = { articles: [] }; }
          
          // Convert articles to GeoJSON features using known location mapping
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
        }
      } catch (e) {
        clearTimeout(timeout2);
        console.warn('Doc fallback failed:', e instanceof Error ? e.message : e);
      }

      // All attempts failed — return empty
      console.log('All GEO attempts failed, returning empty');
      return ok({ type: 'FeatureCollection', features: [] });
    }

    // Article mode
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodedQuery}&mode=artlist&maxrecords=40&format=json&sort=DateDesc&timespan=48h`;
    console.log('Fetching GDELT articles:', url.substring(0, 120));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text();
        console.error('GDELT article error:', response.status, text.substring(0, 200));
        return ok({ articles: [] });
      }

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { articles: [] }; }

      // Filter English-only articles
      const articles = (data?.articles || []).filter((a: any) => 
        !a.language || a.language === 'English'
      );
      
      console.log(`GDELT articles: ${articles.length} English articles`);
      return ok({ articles });
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.error('GDELT articles fetch failed:', fetchErr instanceof Error ? fetchErr.message : fetchErr);
      return ok({ articles: [] });
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return ok({ articles: [] });
  }
});

// Helper: extract approximate coordinates from article title keywords
function extractLocationFromArticle(title: string, domain: string): { lat: number; lng: number } {
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
      // Add small random offset to prevent stacking
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.5,
        lng: coords.lng + (Math.random() - 0.5) * 0.5,
      };
    }
  }
  return { lat: 0, lng: 0 };
}
