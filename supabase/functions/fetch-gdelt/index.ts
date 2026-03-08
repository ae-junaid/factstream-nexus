const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, mode } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const encodedQuery = encodeURIComponent(query);

    if (mode === 'geo') {
      // GDELT GEO API — use PointData mode for proper GeoJSON
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
          // Fallback: return empty features so UI doesn't break
          return new Response(
            JSON.stringify({ success: true, data: { type: 'FeatureCollection', features: [] } }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error('GDELT GEO parse error, returning empty');
          data = { type: 'FeatureCollection', features: [] };
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (fetchErr) {
        clearTimeout(timeout);
        console.error('GDELT GEO fetch failed:', fetchErr);
        return new Response(
          JSON.stringify({ success: true, data: { type: 'FeatureCollection', features: [] } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Default: Article list
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodedQuery}&mode=artlist&maxrecords=75&format=json&sort=DateDesc&timespan=48h`;
    console.log('Fetching GDELT articles:', url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text();
        console.error('GDELT article error:', response.status, text.substring(0, 200));
        return new Response(
          JSON.stringify({ success: true, data: { articles: [] } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { articles: [] };
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.error('GDELT articles fetch failed:', fetchErr);
      return new Response(
        JSON.stringify({ success: true, data: { articles: [] } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
