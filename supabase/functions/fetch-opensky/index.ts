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
      return new Response(
        JSON.stringify(EMPTY),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use adsb.lol — free ADS-B aggregator that works from cloud IPs
    const centerLat = ((lamin + lamax) / 2).toFixed(2);
    const centerLon = ((lomin + lomax) / 2).toFixed(2);
    const dist = Math.round(Math.max(lamax - lamin, lomax - lomin) * 55); // rough nm
    const url = `https://api.adsb.lol/v2/lat/${centerLat}/lon/${centerLon}/dist/${Math.min(dist, 250)}`;

    console.log('Fetching adsb.lol:', url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text();
        console.error('adsb.lol error:', response.status, text.substring(0, 200));
        return new Response(JSON.stringify(EMPTY), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const raw = await response.json();
      // adsb.lol returns { ac: [...], msg: "...", now: ..., total: ... }
      const aircraft = raw?.ac || [];

      // Convert to OpenSky-compatible states format for the client
      const states = aircraft
        .filter((a: any) => a.lat != null && a.lon != null)
        .slice(0, 200)
        .map((a: any) => [
          a.hex || '',           // 0: icao24
          a.flight || '',        // 1: callsign
          a.r || a.t || '',      // 2: origin country / registration
          0,                     // 3: time_position
          0,                     // 4: last_contact
          a.lon,                 // 5: longitude
          a.lat,                 // 6: latitude
          (a.alt_baro === 'ground' ? 0 : a.alt_baro) || 0, // 7: baro_altitude (feet, convert to meters)
          a.alt_baro === 'ground', // 8: on_ground
          (a.gs || 0) * 0.5144,  // 9: velocity (knots to m/s)
          a.track || 0,          // 10: true_track
          (a.baro_rate || 0) * 0.00508, // 11: vertical_rate (fpm to m/s)
          null,                  // 12: sensors
          (a.alt_geom || a.alt_baro === 'ground' ? 0 : a.alt_baro) || 0, // 13: geo_altitude
          a.squawk || '',        // 14: squawk
        ]);

      console.log(`adsb.lol: ${states.length} aircraft found`);

      return new Response(
        JSON.stringify({ success: true, data: { time: Date.now() / 1000, states } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.error('adsb.lol fetch failed:', fetchErr instanceof Error ? fetchErr.message : fetchErr);
      return new Response(JSON.stringify(EMPTY), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify(EMPTY),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
