import { useEffect, useState } from 'react';

interface HealthPayload {
  status: string;
  service: string;
  mockMode?: boolean;
  network?: string;
}

export function MockModeBanner({ className = '' }: { className?: string }) {
  const [mock, setMock] = useState<boolean>(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const url = import.meta.env.VITE_X402_FACILITATOR_URL as string | undefined;
    if (!url) {
      setChecked(true);
      return;
    }
    let aborted = false;
    const run = async () => {
      try {
        const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2500) });
        if (res.ok) {
          const json: HealthPayload = await res.json();
          if (!aborted) setMock(!!json.mockMode);
        }
      } catch { /* ignore */ }
      finally { if (!aborted) setChecked(true); }
    };
    run();
    return () => { aborted = true; };
  }, []);

  if (!checked || !mock) return null;

  return (
    <div className={`w-full bg-amber-50 border-b border-amber-300 text-amber-900 text-sm py-2 px-4 flex items-center justify-center gap-2 ${className}`}>
      <span className="font-semibold">Mock Mode Aktif:</span>
      <span>USDC ödemeleri simüle ediliyor. Gerçek işlemler için facilitator ortamında <code className="font-mono">MOCK_MODE=false</code> yapıp yeniden başlatın.</span>
      <a href="/X402_TESTING_GUIDE" className="underline" target="_blank" rel="noreferrer">Rehber</a>
    </div>
  );
}
