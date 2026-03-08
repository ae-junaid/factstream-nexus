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

    const encodedQuery = encodeURIComponent(query);

    if (mode === 'geo') {
      // GDELT GEO API v2 — use PointData for GeoJSON points
      const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=${encodedQuery}&mode=PointData&format=GeoJSON&timespan=7d&maxpoints=50`;
      console.log('Fetching GDELT GEO:', url);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
          const text = await response.text();
          console.error('GDELT GEO error:', response.status, text.substring(0, 200));
          // Always return 200 with empty data
          return ok({ type: 'FeatureCollection', features: [] });
        }

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error('GDELT GEO parse error');
          data = { type: 'FeatureCollection', features: [] };
        }

        return ok(data);
      } catch (fetchErr) {
        clearTimeout(timeout);
        console.error('GDELT GEO fetch failed:', fetchErr instanceof Error ? fetchErr.message : fetchErr);
        return ok({ type: 'FeatureCollection', features: [] });
      }
    }

    // Default: Article list
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodedQuery}&mode=artlist&maxrecords=50&format=json&sort=DateDesc&timespan=24h`;
    console.log('Fetching GDELT articles:', url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

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
      try {
        data = JSON.parse(text);
      } catch {
        data = { articles: [] };
      }

      return ok(data);
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
