import React, { Suspense, useEffect, useState } from 'react';
import { MarkdownViewer } from '@/components/MarkdownViewer';

export default function DocsSPLXFramework() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/docs/SPL-X-Framework.md')
      .then((res) => res.text())
      .then(setContent);
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">SPL-X Framework — Teknik Mimari & Akış</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <MarkdownViewer content={content} />
      </Suspense>
    </div>
  );
}
