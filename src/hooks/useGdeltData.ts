import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ConflictZone } from '@/lib/conflicts';
import { ConflictEvent, NewsItem, EventType, SourceCredibility, MOCK_EVENTS_BY_CONFLICT, MOCK_NEWS_BY_CONFLICT } from '@/data/mockData';
import { geocodeFromTitle } from '@/lib/geocoding';

function classifyArticle(title: string): EventType {
  const t = title.toLowerCase();
  if (t.includes('airstrike') || t.includes('air strike') || t.includes('bombing') || t.includes('bomb')) return 'airstrike';
  if (t.includes('rocket') || t.includes('missile') || t.includes('projectile') || t.includes('barrage')) return 'rocket_attack';
  if (t.includes('ground offensive') || t.includes('ground operation') || t.includes('ground troops') || t.includes('infantry') || t.includes('ground assault') || t.includes('ground forces') || t.includes('urban combat') || t.includes('street fighting')) return 'ground_operation';
  if (t.includes('diplomatic') || t.includes('ceasefire') || t.includes('negotiate') || t.includes('talks') || t.includes('UN') || t.includes('summit')) return 'diplomatic';
  if (t.includes('humanitarian') || t.includes('aid') || t.includes('refugee') || t.includes('displaced') || t.includes('relief') || t.includes('food') || t.includes('water')) return 'humanitarian';
  if (t.includes('navy') || t.includes('naval') || t.includes('ship') || t.includes('maritime') || t.includes('carrier') || t.includes('vessel')) return 'naval';
  if (t.includes('cyber') || t.includes('hack') || t.includes('internet') || t.includes('digital')) return 'cyber';
  return 'general';
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
  try { return new URL(url).hostname.replace('www.', ''); } catch { return 'unknown'; }
}

function isEnglishText(text: string): boolean {
  if (!text) return false;
  const asciiChars = text.replace(/[^a-zA-Z]/g, '').length;
  const totalChars = text.replace(/[\s\d\W]/g, '').length;
  return totalChars === 0 || (asciiChars / totalChars) > 0.7;
}

export interface GdeltArticle {
  url: string; title: string; seendate: string; socialimage: string; domain: string; language: string; sourcecountry: string;
}

function getMockEvents(conflictId: string): ConflictEvent[] {
  return MOCK_EVENTS_BY_CONFLICT[conflictId] || MOCK_EVENTS_BY_CONFLICT['iran-israel'];
}

function getMockNews(conflictId: string): NewsItem[] {
  return MOCK_NEWS_BY_CONFLICT[conflictId] || MOCK_NEWS_BY_CONFLICT['iran-israel'];
}

export function useGdeltNews(conflict: ConflictZone, refreshInterval = 120000) {
  const [news, setNews] = useState<NewsItem[]>(getMockNews(conflict.id));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset to conflict-specific mock when conflict changes
  useEffect(() => {
    setNews(getMockNews(conflict.id));
    setLoading(true);
  }, [conflict.id]);

  const fetchNews = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-gdelt', {
        body: { query: conflict.gdeltQuery, mode: 'articles' },
      });
      if (fnError) { console.warn('GDELT news error:', fnError.message); setLoading(false); return; }

      const articles: GdeltArticle[] = data?.data?.articles || [];
      const englishArticles = articles.filter(a => (!a.language || a.language === 'English') && isEnglishText(a.title));

      const mapped: NewsItem[] = englishArticles.slice(0, 25).map((a, i) => {
        const domain = extractDomain(a.url);
        return {
          id: `gdelt-n-${i}-${Date.now()}`,
          headline: a.title,
          source: domain,
          credibility: assessCredibility(domain),
          timestamp: a.seendate ? new Date(a.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z')).toISOString() : new Date().toISOString(),
          url: a.url,
          imageUrl: a.socialimage || undefined,
        };
      });

      setNews(mapped.length > 0 ? mapped : getMockNews(conflict.id));
      setError(null);
    } catch (err) {
      console.warn('GDELT news fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [conflict.gdeltQuery, conflict.id]);

  useEffect(() => {
    setLoading(true);
    fetchNews();
    const interval = setInterval(fetchNews, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchNews, refreshInterval]);

  return { news, loading, error, refetch: fetchNews };
}

export function useGdeltEvents(conflict: ConflictZone, refreshInterval = 120000) {
  const [events, setEvents] = useState<ConflictEvent[]>(getMockEvents(conflict.id));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset to conflict-specific mock when conflict changes
  useEffect(() => {
    setEvents(getMockEvents(conflict.id));
    setLoading(true);
  }, [conflict.id]);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-gdelt', {
        body: { query: conflict.gdeltQuery, mode: 'geo' },
      });
      if (fnError) { console.warn('GDELT events error:', fnError.message); setLoading(false); return; }

      const features = data?.data?.features || [];
      const mapped: ConflictEvent[] = features.slice(0, 30).map((f: any, i: number) => {
        const props = f.properties || {};
        const coords = f.geometry?.coordinates || [0, 0];
        const title = props.name || props.html || `Event in ${conflict.shortLabel} region`;
        const domain = props.url ? extractDomain(props.url) : props.domain || 'GDELT';
        return {
          id: `gdelt-e-${i}-${Date.now()}`,
          timestamp: props.urlpubtimedate || new Date().toISOString(),
          type: classifyArticle(title),
          title: title.length > 120 ? title.substring(0, 117) + '...' : title,
          description: props.html || title,
          location: {
            lat: coords[1] || coords[0],
            lng: coords[0] || coords[1],
            name: props.name?.substring(0, 50) || `${coords[1]?.toFixed(2)}°N, ${coords[0]?.toFixed(2)}°E`,
          },
          source: domain,
          credibility: assessCredibility(domain),
          casualties: undefined,
        };
      }).filter((e: ConflictEvent) => isEnglishText(e.title));

      setEvents(mapped.length > 0 ? mapped : getMockEvents(conflict.id));
      setError(null);
    } catch (err) {
      console.warn('GDELT events fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [conflict.gdeltQuery, conflict.shortLabel, conflict.id]);

  useEffect(() => {
    setLoading(true);
    fetchEvents();
    const interval = setInterval(fetchEvents, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchEvents, refreshInterval]);

  return { events, loading, error, refetch: fetchEvents };
}
