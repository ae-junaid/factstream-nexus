import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ConflictZone } from '@/lib/conflicts';
import { ConflictEvent, NewsItem, EventType, SourceCredibility, mockEvents, mockNews } from '@/data/mockData';

// Map GDELT tones / themes to our event types
function classifyArticle(title: string): EventType {
  const t = title.toLowerCase();
  if (t.includes('airstrike') || t.includes('air strike') || t.includes('bombing') || t.includes('bomb')) return 'airstrike';
  if (t.includes('rocket') || t.includes('missile') || t.includes('projectile') || t.includes('barrage')) return 'rocket_attack';
  if (t.includes('ground') || t.includes('troops') || t.includes('infantry') || t.includes('raid') || t.includes('operation') || t.includes('offensive')) return 'ground_operation';
  if (t.includes('diplomatic') || t.includes('ceasefire') || t.includes('negotiate') || t.includes('talks') || t.includes('UN') || t.includes('summit')) return 'diplomatic';
  if (t.includes('humanitarian') || t.includes('aid') || t.includes('refugee') || t.includes('displaced') || t.includes('relief') || t.includes('food') || t.includes('water')) return 'humanitarian';
  if (t.includes('navy') || t.includes('naval') || t.includes('ship') || t.includes('maritime') || t.includes('carrier') || t.includes('vessel')) return 'naval';
  if (t.includes('cyber') || t.includes('hack') || t.includes('internet') || t.includes('digital')) return 'cyber';
  return 'ground_operation';
}

function assessCredibility(domain: string): SourceCredibility {
  const verified = ['reuters.com', 'apnews.com', 'bbc.com', 'bbc.co.uk', 'aljazeera.com', 'france24.com', 'dw.com', 'theguardian.com', 'nytimes.com', 'washingtonpost.com', 'cnn.com'];
  const reliable = ['timesofisrael.com', 'haaretz.com', 'jpost.com', 'middleeasteye.net', 'thenationalnews.com', 'arabnews.com', 'alarabiya.net', 'kyivindependent.com', 'ukrinform.net'];
  
  const d = domain.toLowerCase();
  if (verified.some(v => d.includes(v))) return 'verified';
  if (reliable.some(r => d.includes(r))) return 'reliable';
  return 'unconfirmed';
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

export interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

export function useGdeltNews(conflict: ConflictZone, refreshInterval = 120000) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-gdelt', {
        body: { query: conflict.gdeltQuery, mode: 'articles' },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data?.success) throw new Error(data?.error || 'Failed to fetch news');

      const articles: GdeltArticle[] = data.data?.articles || [];
      
      const mapped: NewsItem[] = articles.slice(0, 25).map((a, i) => {
        const domain = extractDomain(a.url);
        return {
          id: `gdelt-n-${i}-${Date.now()}`,
          headline: a.title,
          source: domain,
          credibility: assessCredibility(domain),
          timestamp: a.seendate ? new Date(a.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z')).toISOString() : new Date().toISOString(),
          url: a.url,
        };
      });

      setNews(mapped.length > 0 ? mapped : mockNews);
      setError(null);
    } catch (err) {
      console.error('GDELT news fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
      // Use mock data as fallback
      setNews(prev => prev.length > 0 ? prev : mockNews);
    } finally {
      setLoading(false);
    }
  }, [conflict.gdeltQuery]);

  useEffect(() => {
    setLoading(true);
    fetchNews();
    const interval = setInterval(fetchNews, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchNews, refreshInterval]);

  return { news, loading, error, refetch: fetchNews };
}

export function useGdeltEvents(conflict: ConflictZone, refreshInterval = 120000) {
  const [events, setEvents] = useState<ConflictEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-gdelt', {
        body: { query: conflict.gdeltQuery, mode: 'geo' },
      });

      if (fnError) {
        console.warn('GDELT events function error:', fnError.message);
        setLoading(false);
        return;
      }
      if (!data?.success && !data?.data) {
        console.warn('GDELT events returned no data');
        setLoading(false);
        return;
      }

      const features = data.data?.features || [];
      
      const mapped: ConflictEvent[] = features.slice(0, 30).map((f: any, i: number) => {
        const props = f.properties || {};
        const coords = f.geometry?.coordinates || [0, 0];
        const title = props.name || props.html || `Event in ${conflict.shortLabel} region`;
        const domain = props.url ? extractDomain(props.url) : 'GDELT';
        
        return {
          id: `gdelt-e-${i}-${Date.now()}`,
          timestamp: props.urlpubtimedate || new Date().toISOString(),
          type: classifyArticle(title),
          title: title.length > 120 ? title.substring(0, 117) + '...' : title,
          description: props.html || title,
          location: {
            lat: coords[1] || coords[0],
            lng: coords[0] || coords[1],
            name: props.name || `${coords[1]?.toFixed(2)}°N, ${coords[0]?.toFixed(2)}°E`,
          },
          source: domain,
          credibility: assessCredibility(domain),
          casualties: undefined,
        };
      });

      setEvents(mapped);
      setError(null);
    } catch (err) {
      console.error('GDELT events fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [conflict.gdeltQuery, conflict.shortLabel]);

  useEffect(() => {
    setLoading(true);
    fetchEvents();
    const interval = setInterval(fetchEvents, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchEvents, refreshInterval]);

  return { events, loading, error, refetch: fetchEvents };
}
