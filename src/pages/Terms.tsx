import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="bg-input text-foreground border border-border mb-4">
            <FileText className="w-4 h-4 mr-2" />
            Terms of Service
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="border border-border bg-card p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground">By accessing or using Noema, you agree to these Terms of Service. If you do not agree, do not use the application.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">2. Non-Custodial</h2>
            <p className="text-sm text-muted-foreground">Noema is non-custodial. You are solely responsible for safeguarding your wallet, private keys, and assets.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">3. On-Chain Transactions</h2>
            <p className="text-sm text-muted-foreground">Blockchain transactions are public and irreversible. Fees and network conditions are outside our control.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">4. No Warranties</h2>
            <p className="text-sm text-muted-foreground">The software is provided “as is” without warranties of any kind, express or implied, including fitness for a particular purpose.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">5. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground">To the maximum extent permitted by law, we are not liable for any damages arising from your use of Noema.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">6. Changes</h2>
            <p className="text-sm text-muted-foreground">We may update these Terms at any time. Continued use constitutes acceptance of the revised Terms.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">7. Jurisdiction</h2>
            <p className="text-sm text-muted-foreground">These Terms are governed by applicable laws of your jurisdiction to the extent not pre-empted by other laws.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">8. Contact</h2>
            <p className="text-sm text-muted-foreground">For questions, open an issue on our GitHub repository.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
