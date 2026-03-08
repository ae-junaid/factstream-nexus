const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lamin, lomin, lamax, lomax } = await req.json();

    if (lamin == null || lomin == null || lamax == null || lomax == null) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bounding box parameters required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try multiple OpenSky endpoints with short timeouts
    const urls = [
      `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`,
    ];

    for (const url of urls) {
      console.log('Trying flight data source:', url);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        });
        clearTimeout(timeout);

        if (response.status === 429) {
          console.log('Rate limited, returning empty');
          return new Response(
            JSON.stringify({ success: true, data: { time: Date.now() / 1000, states: [] }, rateLimited: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!response.ok) {
          const text = await response.text();
          console.error('Flight API error:', response.status, text.substring(0, 200));
          continue; // try next URL
        }

        const data = await response.json();
        console.log(`Flight data received: ${data?.states?.length || 0} aircraft`);

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (fetchErr) {
        clearTimeout(timeout);
        console.error('Flight source timeout/error:', fetchErr instanceof Error ? fetchErr.message : fetchErr);
        continue;
      }
    }

    // All sources failed — return empty gracefully instead of 500
    console.log('All flight sources unavailable, returning empty state');
    return new Response(
      JSON.stringify({ success: true, data: { time: Date.now() / 1000, states: [] }, unavailable: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: true, data: { time: Date.now() / 1000, states: [] }, error: msg }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
