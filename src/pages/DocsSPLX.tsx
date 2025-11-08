import React, { Suspense, useEffect, useState } from 'react';
import { MarkdownViewer } from '@/components/MarkdownViewer';

const SPLX_MD_PATH = '/docs/SPL-X-Framework.md';

export default function DocsSPLX() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(SPLX_MD_PATH)
      .then((res) => res.text())
      .then(setContent);
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">SPL-X Docs & Architecture</h1>
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <MarkdownViewer content={content} />
      </Suspense>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">🔗 Diyagramlar & Akışlar</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <h3 className="font-semibold mb-2">Hero Sphere</h3>
            <img src="/assets/hero-sphere.svg" alt="Hero Sphere" className="w-64 h-64" />
            <p className="text-sm text-slate-600 mt-2">AI agent orb ve modül nodları.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <h3 className="font-semibold mb-2">Flow Diagram</h3>
            <img src="/assets/flow-diagram.svg" alt="Flow Diagram" className="w-96 h-32" />
            <p className="text-sm text-slate-600 mt-2">Identity → Reputation → Payments → Trust akışı.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <h3 className="font-semibold mb-2">Layered Architecture</h3>
            <img src="/assets/layered-architecture.svg" alt="Layered Architecture" className="w-80 h-56" />
            <p className="text-sm text-slate-600 mt-2">Katmanlı SPL-X mimari şeması.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
