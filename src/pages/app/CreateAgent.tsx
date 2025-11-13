import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function CreateAgent() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set('create', '1');
    setSearchParams(next, { replace: true });
    window.location.replace('/app/agents?create=1');
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-center p-8">
      <div className="space-y-3 max-w-md">
        <h1 className="text-xl font-semibold">Redirecting…</h1>
        <p className="text-muted-foreground text-sm">
          Opening Create Agent modal inside Agents workspace.
        </p>
      </div>
    </div>
  );
}
