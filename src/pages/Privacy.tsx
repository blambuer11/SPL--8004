import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="bg-input text-foreground border border-border mb-4">
            <Shield className="w-4 h-4 mr-2" />
            Privacy Policy
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="border border-border bg-card p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">1. Overview</h2>
            <p className="text-sm text-muted-foreground">Noema is a non-custodial, client-side application. We do not collect personal data beyond what is necessary to enable wallet connections and on-chain interactions.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">2. Data We Process</h2>
            <ul className="list-disc ml-5 space-y-2 text-sm text-muted-foreground">
              <li>Public blockchain data: agent identities, validations, reputation, rewards.</li>
              <li>Wallet public key and signatures (handled locally via wallet adapters).</li>
              <li>Basic telemetry (optional): anonymous performance metrics to improve UX (if enabled).</li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">3. What We Do Not Collect</h2>
            <ul className="list-disc ml-5 space-y-2 text-sm text-muted-foreground">
              <li>Private keys or seed phrases.</li>
              <li>Personally identifiable information (PII) such as name, email, address.</li>
              <li>Off-chain behavioral tracking without explicit consent.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">4. Cookies and Storage</h2>
            <p className="text-sm text-muted-foreground">We may use localStorage or similar mechanisms to persist UI preferences. No tracking cookies are used by default.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">5. Third-Party Services</h2>
            <p className="text-sm text-muted-foreground">Wallet adapters and RPC providers are third-party services. Their privacy policies apply when you use them.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">6. Contact</h2>
            <p className="text-sm text-muted-foreground">Questions? Open an issue on our GitHub repository.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
