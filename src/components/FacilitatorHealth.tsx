import { useEffect, useState } from 'react';

export function FacilitatorHealth({ className = '' }: { className?: string }) {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [url, setUrl] = useState<string>('');
  const [configured, setConfigured] = useState<boolean>(false);

  useEffect(() => {
    const envUrl = import.meta.env.VITE_X402_FACILITATOR_URL as string | undefined;
    if (!envUrl) {
      setConfigured(false);
      setUrl('');
      setHealthy(null);
      return; // not configured, stay neutral
    }
    setConfigured(true);
    const facilitator = envUrl || 'http://localhost:3000';
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

  const dotColor = !configured
    ? 'bg-gray-300'
    : healthy == null
      ? 'bg-gray-300'
      : healthy
        ? 'bg-emerald-500'
        : 'bg-red-500';
  const label = !configured
    ? 'Not configured (set VITE_X402_FACILITATOR_URL)'
    : healthy == null
      ? 'Checking'
      : healthy
        ? 'Facilitator OK'
        : 'Facilitator Down';

  return (
    configured ? (
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
    ) : (
      <span
        className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs border border-border bg-muted/40 text-muted-foreground ${className}`}
        title={label}
      >
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotColor}`} />
        X402
      </span>
    )
  );
}
