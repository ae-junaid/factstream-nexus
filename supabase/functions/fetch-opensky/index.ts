const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const EMPTY = { success: true, data: { time: Date.now() / 1000, states: [] }, unavailable: true };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lamin, lomin, lamax, lomax } = await req.json();

    if (lamin == null || lomin == null || lamax == null || lomax == null) {
      return new Response(JSON.stringify(EMPTY), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const centerLat = ((lamin + lamax) / 2).toFixed(2);
    const centerLon = ((lomin + lomax) / 2).toFixed(2);
    const dist = Math.round(Math.max(lamax - lamin, lomax - lomin) * 55);

    // Try multiple ADS-B sources
    const sources = [
      { name: 'adsb.lol', url: `https://api.adsb.lol/v2/lat/${centerLat}/lon/${centerLon}/dist/${Math.min(dist, 250)}` },
      { name: 'opensky', url: `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}` },
    ];

    for (const source of sources) {
      console.log(`Trying ${source.name}:`, source.url);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(source.url, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
        clearTimeout(timeout);

        if (!response.ok) {
          const text = await response.text();
          console.warn(`${source.name} error:`, response.status, text.substring(0, 100));
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
            console.log(`${source.name}: ${states.length} aircraft found`);
            return new Response(
              JSON.stringify({ success: true, data: { time: Date.now() / 1000, states } }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.log(`${source.name}: 0 aircraft, trying next source`);
        } else {
          // OpenSky format
          const states = raw?.states || [];
          if (states.length > 0) {
            console.log(`${source.name}: ${states.length} aircraft found`);
            return new Response(
              JSON.stringify({ success: true, data: { time: raw?.time || Date.now() / 1000, states } }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.log(`${source.name}: 0 aircraft`);
        }
      } catch (fetchErr) {
        clearTimeout(timeout);
        console.warn(`${source.name} fetch failed:`, fetchErr instanceof Error ? fetchErr.message : fetchErr);
      }
    }

    // All sources returned 0 — return empty
    console.log('All ADS-B sources returned 0 aircraft');
    return new Response(JSON.stringify(EMPTY), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify(EMPTY), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
