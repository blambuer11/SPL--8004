import { useEffect, useState } from 'react';

export function FacilitatorHealth({ className = '' }: { className?: string }) {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const facilitator = import.meta.env.VITE_X402_FACILITATOR_URL || 'http://localhost:3000';
    setUrl(facilitator);

    let aborted = false;
    const check = async () => {
      try {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), 2500);
        const res = await fetch(`${facilitator}/health`, { signal: ctrl.signal });
        clearTimeout(id);
        if (!aborted) setHealthy(res.ok);
      } catch {
        if (!aborted) setHealthy(false);
      }
    };
    check();
    const t = setInterval(check, 15000);
    return () => { aborted = true; clearInterval(t); };
  }, []);

  const dotColor = healthy == null ? 'bg-gray-300' : healthy ? 'bg-emerald-500' : 'bg-red-500';
  const label = healthy == null ? 'Checking' : healthy ? 'Facilitator OK' : 'Facilitator Down';

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs border border-border hover:bg-muted transition ${className}`}
      title={`X402 Facilitator: ${label}`}
    >
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotColor}`} />
      <span className="text-muted-foreground">X402</span>
    </a>
  );
}
