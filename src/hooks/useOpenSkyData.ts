import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ConflictZone } from '@/lib/conflicts';

export interface LiveFlight {
  icao24: string;
  callsign: string;
  originCountry: string;
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
  heading: number;
  verticalRate: number;
  onGround: boolean;
  squawk: string;
}

export function useOpenSkyFlights(conflict: ConflictZone, refreshInterval = 30000) {
  const [flights, setFlights] = useState<LiveFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  // Use conflict.id as stable dependency instead of bbox object
  const fetchFlights = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-opensky', {
        body: conflict.bbox,
      });

      if (fnError) { console.warn('OpenSky error:', fnError.message); setLoading(false); return; }
      if (!data?.success && !data?.data) { setLoading(false); return; }

      setRateLimited(!!data.rateLimited);
      const states: any[][] = data.data?.states || [];
      
      const mapped: LiveFlight[] = states
        .filter((s: any[]) => s[5] != null && s[6] != null && !s[8])
        .map((s: any[]) => ({
          icao24: s[0] || '',
          callsign: (s[1] || '').trim(),
          originCountry: s[2] || '',
          lat: s[6],
          lng: s[5],
          altitude: Math.round(s[7] || 0),
          velocity: Math.round((s[9] || 0) * 1.944),
          heading: Math.round(s[10] || 0),
          verticalRate: Math.round((s[11] || 0) * 196.85),
          onGround: s[8] || false,
          squawk: s[14] || '—',
        }));

      setFlights(mapped);
      setError(null);
    } catch (err) {
      console.error('OpenSky fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conflict.id]);

  useEffect(() => {
    setFlights([]);
    setLoading(true);
    fetchFlights();
    const interval = setInterval(fetchFlights, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchFlights, refreshInterval]);

  return { flights, loading, error, rateLimited, refetch: fetchFlights };
}
