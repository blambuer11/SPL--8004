import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function Developer() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">👨‍💻 Developer Portal</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Start: SDK ile Entegrasyon</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal ml-6 space-y-2">
            <li>
              <b>SDK Yükle:</b>
              <pre className="bg-gray-100 rounded p-2 mt-1">npm install @solana/web3.js @coral-xyz/anchor</pre>
            </li>
            <li>
              <b>Protokol Fonksiyonlarını Kullan:</b>
              <pre className="bg-gray-100 rounded p-2 mt-1">import { useSPL8004 } from '../hooks/useSPL8004';
const { registerAgent } = useSPL8004();
await registerAgent({
  name: "GPT-Agent-001",
  metadataUri: "ipfs://QmExample..."
});</pre>
            </li>
            <li>
              <b>Agent Sorgula:</b>
              <pre className="bg-gray-100 rounded p-2 mt-1">const agent = await program.account.agent.fetch(agentPubkey);
console.log(agent);</pre>
            </li>
          </ol>
        </CardContent>
      </Card>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>REST API (Yakında)</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Şu an doğrudan frontend/SDK ile entegrasyon mümkündür. REST API endpointleri ve Postman dokümantasyonu Q1 2025'te eklenecektir.</p>
        </CardContent>
      </Card>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Kaynaklar</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 space-y-1">
            <li><a className="text-blue-600 underline" href="https://agent-aura-sovereign.vercel.app/docs" target="_blank" rel="noopener noreferrer">Protokol Dokümantasyonu</a></li>
            <li><a className="text-blue-600 underline" href="https://github.com/blambuer11/SPL--8004" target="_blank" rel="noopener noreferrer">GitHub Kaynağı</a></li>
            <li><a className="text-blue-600 underline" href="https://explorer.solana.com/address/G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW?cluster=devnet" target="_blank" rel="noopener noreferrer">SPL-8004 Explorer</a></li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Testnet ile Deneyin</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Demo cüzdanı ile test işlemleri için <b>Docs</b> sayfasındaki örnekleri kullanabilirsiniz. Kendi agentınızı kaydedin, yetenek ekleyin ve reputation puanınızı sorgulayın!</p>
        </CardContent>
      </Card>
    </div>
  );
}
