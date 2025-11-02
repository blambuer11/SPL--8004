import Stripe from 'stripe';

export const config = {
  api: { bodyParser: false },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) {
    return res.status(501).json({ error: 'Stripe webhook not configured' });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed':
        // TODO: mark subscription active for customer
        break;
      case 'invoice.paid':
        break;
      case 'customer.subscription.deleted':
        break;
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err?.message || 'unknown'}`);
  }
}
