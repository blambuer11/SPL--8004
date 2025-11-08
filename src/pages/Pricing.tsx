import { useState } from 'react';
import { Check, Zap, Code, Palette, ArrowRight, CreditCard, Wallet, DollarSign, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const pricingPlans = [
  {
    name: 'TypeScript SDK',
    description: 'Full-featured SDK for TypeScript/JavaScript developers',
    icon: Code,
    tiers: [
      {
        name: 'Starter',
        price: '$99',
        period: '/month',
        description: 'Perfect for indie developers',
        features: [
          '10,000 API calls/month',
          'Up to 5 agents',
          'Basic reputation tracking',
          'Email support',
          'Community access',
          'SDK updates',
        ],
        cta: 'Start Building',
        popular: false,
      },
      {
        name: 'Professional',
        price: '$299',
        period: '/month',
        description: 'For growing teams',
        features: [
          '100,000 API calls/month',
          'Up to 50 agents',
          'Advanced analytics',
          'Priority support',
          'Webhook integration',
          'Custom validation logic',
          'Team collaboration',
        ],
        cta: 'Get Started',
        popular: true,
      },
      {
        name: 'Enterprise',
        price: '$999',
        period: '/month',
        description: 'For large-scale operations',
        features: [
          'Unlimited API calls',
          'Unlimited agents',
          'Advanced analytics + BI',
          '24/7 dedicated support',
          'Custom integrations',
          'SLA guarantee',
          'On-premise deployment',
          'White-label options',
        ],
        cta: 'Contact Sales',
        popular: false,
      },
    ],
  },
  {
    name: 'REST API',
    description: 'Language-agnostic HTTP API for any platform',
    icon: Zap,
    pricing: {
      model: 'Pay-as-you-go',
      rate: '$0.001',
      unit: 'per API call',
      description: 'No monthly fees, only pay for what you use',
      features: [
        'Any programming language',
        'Global CDN endpoints',
        'Real-time webhooks',
        'Auto-scaling',
        'Built-in rate limiting',
        '99.99% uptime SLA',
      ],
      cta: 'Get API Key',
    },
  },
  {
    name: 'No-Code Kit',
    description: 'Visual builder for non-technical teams',
    icon: Palette,
    tiers: [
      {
        name: 'Basic',
        price: '$29',
        period: '/month',
        description: 'For small projects',
        features: [
          'Visual workflow builder',
          '5 agents',
          '1,000 tasks/month',
          'Pre-built templates',
          'Email notifications',
          'Basic analytics',
        ],
        cta: 'Start Free Trial',
        popular: false,
      },
      {
        name: 'Pro',
        price: '$99',
        period: '/month',
        description: 'For production workflows',
        features: [
          'Advanced workflow builder',
          '25 agents',
          '10,000 tasks/month',
          'Custom templates',
          'Slack/Discord webhooks',
          'Advanced analytics',
          'Team collaboration',
        ],
        cta: 'Start Free Trial',
        popular: true,
      },
      {
        name: 'Business',
        price: '$499',
        period: '/month',
        description: 'For enterprise teams',
        features: [
          'Enterprise workflow builder',
          'Unlimited agents',
          'Unlimited tasks',
          'White-label interface',
          'Custom integrations',
          'Priority support',
          'SSO/SAML',
          'Advanced permissions',
        ],
        cta: 'Contact Sales',
        popular: false,
      },
    ],
  },
];

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [solanaPayOpen, setSolanaPayOpen] = useState(false);
  const [solanaPayUrl, setSolanaPayUrl] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'checking' | 'success' | 'not-found' | 'error'>('idle');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
  const [activating, setActivating] = useState(false);

  const startSolanaPay = async (planName: string, priceLabel: string) => {
    try {
      setLoadingPlan(planName);
      const numeric = Number(priceLabel.replace(/[^0-9.]/g, ''));
      if (!numeric || isNaN(numeric)) throw new Error('Invalid price for Solana Pay');
      const body = {
        amount: numeric,
        label: `Noema ${planName} (Monthly)`,
        message: `${planName} plan subscription`,
        memo: `noema-sdk-${planName.toLowerCase()}`,
      };
      const resp = await fetch('/api/crypto/solana-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Solana Pay init failed');
      if (json.url) {
        setSolanaPayUrl(json.url as string);
        setSelectedPlan({ name: planName, price: priceLabel });
        setSolanaPayOpen(true);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Solana Pay init failed';
      alert(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  const getApiKey = async (plan: string = 'rest-api') => {
    try {
      setApiKeyError(null);
      setApiKey(null);
      const resp = await fetch('/api/keys/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Could not create API key');
      setApiKey(json.apiKey);
      setApiKeyOpen(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not create API key';
      setApiKeyError(msg);
      setApiKeyOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-bold mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Infrastructure Tier
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Build autonomous AI agents with the tools that fit your workflow. All plans include gasless transactions via Kora.
          </p>
        </div>

        {/* SDK Pricing */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">TypeScript SDK</h2>
              <p className="text-muted-foreground">Full-featured SDK for TypeScript/JavaScript developers</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans[0].tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative ${
                  tier.popular
                    ? 'border-2 border-primary shadow-xl scale-105'
                    : 'border-border/50 hover:border-primary/50'
                } transition-all`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {tier.name.toLowerCase().includes('enterprise') ? (
                    <Button
                      onClick={() => {/* contact flow stays as is for now */}}
                      disabled={false}
                      className={`w-full ${
                        tier.popular
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-glow'
                          : ''
                      }`}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => startSolanaPay(tier.name, tier.price)}
                      disabled={loadingPlan !== null}
                      className={`w-full ${
                        tier.popular
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-glow'
                          : ''
                      }`}
                    >
                      {loadingPlan && (
                        <span className="mr-2 animate-pulse">Processing…</span>
                      )}
                      Pay with Solana
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* REST API Pricing */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">REST API</h2>
              <p className="text-muted-foreground">Language-agnostic HTTP API for any platform</p>
            </div>
          </div>

          <Card className="max-w-2xl mx-auto border-2 border-cyan-500/50 hover:border-cyan-500 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{pricingPlans[1].pricing.model}</CardTitle>
                  <CardDescription>{pricingPlans[1].pricing.description}</CardDescription>
                </div>
                <Badge className="bg-cyan-500 text-white">No Monthly Fee</Badge>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">{pricingPlans[1].pricing.rate}</span>
                <span className="text-muted-foreground"> {pricingPlans[1].pricing.unit}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {pricingPlans[1].pricing.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => getApiKey()} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-glow">
                {pricingPlans[1].pricing.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* No-Code Kit Pricing */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">No-Code Kit</h2>
              <p className="text-muted-foreground">Visual builder for non-technical teams</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans[2].tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative ${
                  tier.popular
                    ? 'border-2 border-pink-500 shadow-xl scale-105'
                    : 'border-border/50 hover:border-pink-500/50'
                } transition-all`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-pink-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-pink-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    disabled
                    title="Coming soon"
                    className={`w-full opacity-60 cursor-not-allowed ${
                      tier.popular
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600'
                        : ''
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-24 mb-16">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <Shield className="w-4 h-4 mr-2" />
              Secure Payments
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Accepted Payment Methods</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We accept multiple payment methods for your convenience. All transactions are encrypted and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Credit/Debit Cards */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                  <CreditCard className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl text-blue-900">Credit & Debit Cards</CardTitle>
                <CardDescription className="text-gray-700">
                  Major card networks accepted worldwide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-700">Visa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-700">Mastercard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-700">American Express</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-700">Discover</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-xs text-gray-600">
                      <strong>Processing:</strong> Instant approval
                      <br />
                      <strong>Security:</strong> PCI DSS Level 1 compliant
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crypto */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                  <Wallet className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl text-purple-900">Cryptocurrency</CardTitle>
                <CardDescription className="text-gray-700">
                  Primary: Solana Pay (USDC). Ethereum options coming soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-gray-700">USDC (Solana)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-gray-700">USDT (Solana)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-gray-700">SOL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-gray-700">ETH / USDC (Ethereum)</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <p className="text-xs text-gray-600">
                      <strong>Processing:</strong> On-chain settlement
                      <br />
                      <strong>Discount:</strong> 5% off with crypto payments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Transfer / Wire */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl text-green-900">Bank Transfer</CardTitle>
                <CardDescription className="text-gray-700">
                  Direct bank transfer or wire payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-700">ACH (US only)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-700">SEPA (Europe)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-700">Wire Transfer (Global)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-700">Invoice Billing (NET-30)</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-xs text-gray-600">
                      <strong>Processing:</strong> 1-3 business days
                      <br />
                      <strong>Minimum:</strong> $299/month plans and above
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Card className="max-w-2xl mx-auto border-gray-200 bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Enterprise-Grade Security</h3>
                </div>
                <p className="text-sm text-gray-600">
                  All payments are processed through PCI DSS Level 1 certified payment processors. 
                  We never store your credit card information on our servers. Crypto payments are handled 
                  via non-custodial smart contracts on Solana/Ethereum.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ / Additional Info */}
        <div className="mt-16 text-center">
          <Card className="max-w-3xl mx-auto border-border/50">
            <CardHeader>
              <CardTitle>Need a Custom Solution?</CardTitle>
              <CardDescription>
                For enterprises with unique requirements, we offer custom plans with dedicated support, SLAs, and on-premise deployment.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button variant="outline" size="lg">
                Contact Enterprise Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* API Key Dialog */}
      <Dialog open={apiKeyOpen} onOpenChange={setApiKeyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your API Key</DialogTitle>
            <DialogDescription>
              Store this key securely. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          {apiKey && (
            <div className="mt-2">
              <div className="p-3 bg-gray-100 rounded font-mono text-xs break-all select-all">{apiKey}</div>
              <div className="mt-2 text-xs text-gray-500">Include as Bearer token in Authorization header.</div>
            </div>
          )}
          {apiKeyError && (
            <div className="mt-2 text-sm text-red-600">{apiKeyError}</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiKeyOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Solana Pay Dialog */}
      <Dialog open={solanaPayOpen} onOpenChange={setSolanaPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay with Solana Pay (USDC)</DialogTitle>
            <DialogDescription>Scan the QR with your Solana wallet or copy the link.</DialogDescription>
          </DialogHeader>
          {solanaPayUrl ? (
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-3 rounded">
                <QRCode value={solanaPayUrl} size={200} />
              </div>
              <div className="text-xs text-gray-600 break-all max-w-full text-center select-all">
                {solanaPayUrl}
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(solanaPayUrl)}>Copy Link</Button>
                <Button onClick={() => window.location.href = solanaPayUrl}>Open in Wallet</Button>
              </div>
              <div className="w-full mt-4 border-t pt-3">
                <div className="text-sm font-medium mb-2">Verify Payment</div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={verifyStatus === 'checking'}
                    onClick={async () => {
                      try {
                        setVerifyStatus('checking');
                        setVerifyError(null);
                        // Infer amount and memo from URL
                        const u = new URL(solanaPayUrl);
                        const amount = Number(u.searchParams.get('amount') || '0');
                        const memo = u.searchParams.get('memo') || '';
                        const resp = await fetch('/api/crypto/verify-payment', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ amount, memo }),
                        });
                        const j = await resp.json();
                        if (!resp.ok) throw new Error(j?.error || 'Verification failed');
                        if (j.confirmed) setVerifyStatus('success'); else setVerifyStatus('not-found');
                      } catch (e: unknown) {
                        setVerifyStatus('error');
                        const msg = e instanceof Error ? e.message : 'Verification error';
                        setVerifyError(msg);
                      }
                    }}
                  >
                    {verifyStatus === 'checking' ? 'Checking…' : 'Check Payment'}
                  </Button>
                  {verifyStatus === 'success' && <span className="text-green-600 text-sm self-center">Payment confirmed ✅</span>}
                  {verifyStatus === 'success' && (
                    <Button
                      disabled={activating}
                      onClick={async () => {
                        try {
                          setActivating(true);
                          const planKey = selectedPlan ? `sdk-${selectedPlan.name.toLowerCase()}` : 'sdk';
                          await getApiKey(planKey);
                          if (selectedPlan) {
                            localStorage.setItem('noema_sdk_active', JSON.stringify({ plan: selectedPlan.name, at: Date.now() }));
                          }
                          setSolanaPayOpen(false);
                        } finally {
                          setActivating(false);
                        }
                      }}
                    >
                      {activating ? 'Activating…' : 'Activate SDK Access'}
                    </Button>
                  )}
                  {verifyStatus === 'not-found' && <span className="text-yellow-700 text-sm self-center">Not found yet ⏳</span>}
                  {verifyStatus === 'error' && <span className="text-red-600 text-sm self-center">{verifyError}</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Preparing Solana Pay link…</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSolanaPayOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
