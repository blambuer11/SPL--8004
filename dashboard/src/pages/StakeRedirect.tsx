import { useEffect } from 'react';

export default function StakeRedirect() {
  useEffect(() => {
    // Always go to staking tab in the same app
    const target = '/app?tab=staking';
    if (window.location.pathname !== '/app' || new URLSearchParams(window.location.search).get('tab') !== 'staking') {
      window.location.replace(target);
    }
  }, []);
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-center p-8">
      <div className="space-y-3 max-w-md">
        <h1 className="text-xl font-semibold">Yönlendiriliyor...</h1>
        <p className="text-muted-foreground text-sm">
          Validator staking sekmesine aktarılıyorsunuz.
        </p>
      </div>
    </div>
  );
}
