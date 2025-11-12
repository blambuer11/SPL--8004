import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const priceMap = {
    starter: process.env.STRIPE_PRICE_STARTER,
    pro: process.env.STRIPE_PRICE_PRO,
    professional: process.env.STRIPE_PRICE_PRO,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
  };

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const plan = body.plan;

    if (!stripeSecret) {
      return res.status(501).json({ error: 'Stripe is not configured (STRIPE_SECRET_KEY missing).'});
    }
    if (!plan || !priceMap[plan]) {
      return res.status(400).json({ error: 'Invalid or missing plan.' });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://noemaprotocol.xyz';
    const successUrl = `${baseUrl}/?checkout=success`;
    const cancelUrl = `${baseUrl}/pricing?checkout=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceMap[plan], quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: { plan },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}
