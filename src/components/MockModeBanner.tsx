import React from 'react';

// Basit Mock Mode Banner komponenti
// import.meta.env.VITE_MOCK_MODE true ise gösterir.
// Uygulamada named export beklendiği için aşağıdaki isimle export ediliyor.
export function MockModeBanner() {
	const isMock = Boolean((import.meta as any).env?.VITE_MOCK_MODE);
	if (!isMock) return null;
	return (
		<div className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-900 text-sm py-2 px-4 shadow-md flex items-center justify-center gap-3">
			<span className="font-semibold">MOCK MODE</span>
			<span className="opacity-80">Chain yazma işlemleri simüle ediliyor.</span>
		</div>
	);
}

export default MockModeBanner;
