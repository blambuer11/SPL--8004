import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface HealthPayload {
  status: string;
  service: string;
  mockMode?: boolean;
  network?: string;
  [k: string]: unknown;
}

interface SupportedPayload {
  version: string;
  network: string;
  paymentScheme?: string;
  feePayer?: string;
  tokens?: Array<{ mint: string; symbol: string; decimals: number }>;
  endpoints?: { verify: string; settle: string };
  [k: string]: unknown;
}

export function FacilitatorHealth({ className = '' }: { className?: string }) {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [url, setUrl] = useState<string>('');
  const [configured, setConfigured] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [healthData, setHealthData] = useState<HealthPayload | null>(null);
  const [supportedData, setSupportedData] = useState<SupportedPayload | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    const envUrl = import.meta.env.VITE_X402_FACILITATOR_URL as string | undefined;
    if (!envUrl) {
      setConfigured(false);
      setUrl('');
      setHealthy(null);
      return;
    }
    setConfigured(true);
    const facilitator = envUrl || 'https://noemaprotocol.xyz/api/x402';
    setUrl(facilitator);

    let aborted = false;
    const check = async () => {
      try {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), 2500);
        const res = await fetch(`${facilitator}/health`, { signal: ctrl.signal });
        clearTimeout(id);
        if (!aborted) {
          setHealthy(res.ok);
          if (res.ok) {
            try {
              const json = await res.json();
              setHealthData(json);
            } catch {/* ignore json parse */}
          }
        }
      } catch {
        if (!aborted) setHealthy(false);
      }
    };
    check();
    const t = setInterval(check, 15000);
    return () => { aborted = true; clearInterval(t); };
  }, []);

  const loadDetails = useCallback(async () => {
    if (!url) return;
    setLoadingDetails(true);
    setDetailsError(null);
    try {
      const [healthRes, supportedRes] = await Promise.all([
        fetch(`${url}/health`).then(r => r.ok ? r.json() : Promise.reject(new Error(`Health ${r.status}`))),
        fetch(`${url}/supported`).then(r => r.ok ? r.json() : Promise.reject(new Error(`Supported ${r.status}`)))
      ]);
      setHealthData(healthRes);
      setSupportedData(supportedRes);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load details';
      setDetailsError(msg);
    } finally {
      setLoadingDetails(false);
    }
  }, [url]);

  useEffect(() => {
    if (open && configured) {
      void loadDetails();
    }
  }, [open, configured, loadDetails]);

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

  if (!configured) {
    return (
      <span
        className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs border border-border bg-muted/40 text-muted-foreground ${className}`}
        title={label}
      >
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotColor}`} />
        X402
      </span>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs border border-border hover:bg-muted transition ${className}`}
          title={`X402 Facilitator: ${label}`}
        >
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <span className="text-muted-foreground">X402</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>X402 Facilitator Status</DialogTitle>
          <DialogDescription>
            Ayrıntılı sağlık ve yetenek bilgileri. Endpoint: <code className="font-mono">{url}</code>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotColor}`} />
              <span className="font-medium">{label}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => void loadDetails()} disabled={loadingDetails}>
              {loadingDetails && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}Yenile
            </Button>
          </div>
          {detailsError && (
            <div className="text-xs text-red-600 border border-red-300 bg-red-50 rounded p-2">{detailsError}</div>
          )}
          <ScrollArea className="h-64 w-full rounded border border-muted bg-muted/30 p-3">
            <pre className="text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-words">
{JSON.stringify({ health: healthData, supported: supportedData }, null, 2)}
            </pre>
          </ScrollArea>
          {healthData?.mockMode && (
            <div className="text-xs mt-2 p-2 rounded bg-amber-50 border border-amber-300 text-amber-800">
              Mock Mode ENABLED — USDC transactions are simulated. For real payments, set <code>MOCK_MODE=false</code> in facilitator and restart.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
