import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';

export default function ArticleView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const url = params.get('url');
  const title = params.get('title') || 'Article';
  const source = params.get('source') || '';

  if (!url) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-ops-amber mx-auto" />
          <p className="text-sm text-muted-foreground">No article URL provided</p>
          <button onClick={() => navigate('/')} className="text-xs text-primary hover:underline">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2 bg-card border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">DASHBOARD</span>
        </button>

        <div className="h-4 w-px bg-border" />

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{decodeURIComponent(title)}</p>
          {source && (
            <p className="text-[10px] text-muted-foreground font-mono uppercase">{decodeURIComponent(source)}</p>
          )}
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded border border-border text-[10px] font-bold tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          OPEN ORIGINAL
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Article iframe */}
      <div className="flex-1 relative">
        <iframe
          src={url}
          title={decodeURIComponent(title)}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          referrerPolicy="no-referrer"
        />
        {/* Fallback overlay if iframe blocked */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/95 border border-border shadow-lg text-xs text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-ops-amber" />
            If article doesn't load, click to open in new tab
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
