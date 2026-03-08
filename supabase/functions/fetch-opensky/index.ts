const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ok = (data: unknown) => new Response(
  JSON.stringify(data),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);

const EMPTY = { success: true, data: { time: Date.now() / 1000, states: [] } };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lamin, lomin, lamax, lomax } = await req.json();
    if (lamin == null || lomin == null || lamax == null || lomax == null) {
      return ok(EMPTY);
    }

    const centerLat = ((lamin + lamax) / 2).toFixed(2);
    const centerLon = ((lomin + lomax) / 2).toFixed(2);
    // Use larger radius to capture more aircraft
    const dist = Math.round(Math.max(lamax - lamin, lomax - lomin) * 60);
    const cappedDist = Math.min(dist, 500);

    // Try OpenSky FIRST (bbox query is more reliable), then adsb.lol as fallback
    const sources = [
      {
        name: 'opensky',
        url: `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`,
        timeout: 15000,
      },
      {
        name: 'adsb.lol',
        url: `https://api.adsb.lol/v2/lat/${centerLat}/lon/${centerLon}/dist/${cappedDist}`,
        timeout: 12000,
      },
      {
        name: 'adsbx-rapid',
        url: `https://adsbexchange-com-adsbx.p.rapidapi.com/v2/lat/${centerLat}/lon/${centerLon}/dist/${Math.min(cappedDist, 250)}/`,
        timeout: 10000,
      },
    ];

    for (const source of sources) {
      console.log(`Trying ${source.name}:`, source.url.substring(0, 100));
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), source.timeout);

      try {
        const headers: Record<string, string> = { 'Accept': 'application/json' };
        // Skip rapidapi if no key configured
        if (source.name === 'adsbx-rapid') {
          clearTimeout(timeout);
          continue; // Skip — requires API key
        }

        const response = await fetch(source.url, { signal: controller.signal, headers });
        clearTimeout(timeout);

        if (!response.ok) {
          console.warn(`${source.name}: HTTP ${response.status}`);
          continue;
        }

        const raw = await response.json();

        if (source.name === 'adsb.lol') {
          const aircraft = raw?.ac || [];
          const states = aircraft
            .filter((a: any) => a.lat != null && a.lon != null)
            .slice(0, 200)
            .map((a: any) => [
              a.hex || '',
              (a.flight || '').trim(),
              a.r || a.t || a.desc || '',
              0, 0,
              a.lon, a.lat,
              (a.alt_baro === 'ground' ? 0 : a.alt_baro) || 0,
              a.alt_baro === 'ground',
              (a.gs || 0) * 0.5144,
              a.track || 0,
              (a.baro_rate || 0) * 0.00508,
              null,
              (a.alt_geom || 0),
              a.squawk || '',
            ]);

          if (states.length > 0) {
            console.log(`${source.name}: ${states.length} aircraft`);
            return ok({ success: true, data: { time: Date.now() / 1000, states } });
          }
          console.log(`${source.name}: 0 aircraft`);
        } else {
          // OpenSky format
          const states = raw?.states || [];
          if (states.length > 0) {
            console.log(`${source.name}: ${states.length} aircraft`);
            return ok({ success: true, data: { time: raw?.time || Date.now() / 1000, states } });
          }
          console.log(`${source.name}: 0 aircraft`);
        }
      } catch (fetchErr) {
        clearTimeout(timeout);
        console.warn(`${source.name} failed:`, fetchErr instanceof Error ? fetchErr.message : fetchErr);
      }
    }

    console.log('All ADS-B sources returned 0 aircraft');
    return ok(EMPTY);
  } catch (error) {
    console.error('Edge function error:', error);
    return ok(EMPTY);
  }
});
