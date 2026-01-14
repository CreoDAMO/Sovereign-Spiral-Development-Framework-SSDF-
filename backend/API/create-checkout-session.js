// api/create-checkout-session.js
// Stripe checkout session creation for Vercel serverless

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// SKU Price Map (Server-side authority)
const PRICE_MAP = {
  'workflow-yaml-fixer-pro-commercial': 499,
  'workflow-yaml-fixer-pro-enterprise': 999,
  'default-commercial': 299,
  'default-enterprise': 799
};

// Rate limiting state (in-memory, resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 50;

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Remove old requests
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

function validateAndMapItems(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Invalid or empty items array');
  }

  return items.map(item => {
    if (!item.name || !item.licenseType) {
      throw new Error('Missing required fields: name, licenseType');
    }

    const sku = `${item.name.toLowerCase().replace(/\s+/g, '-')}-${item.licenseType}`;
    const price = PRICE_MAP[sku] || PRICE_MAP[`default-${item.licenseType}`];

    if (!price) {
      throw new Error(`Invalid SKU: ${sku}`);
    }

    return {
      name: item.name,
      licenseType: item.licenseType,
      price: price,
      sku: sku
    };
  });
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ 
      error: 'Too many checkout attempts. Please try again later.' 
    });
  }

  try {
    const validatedItems = validateAndMapItems(req.body.items);

    const lineItems = validatedItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.name} - ${item.licenseType} License`,
          description: `Commercial license for ${item.name}`
        },
        unit_amount: item.price * 100,
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || req.headers.origin}/cancel`,
      metadata: {
        items: JSON.stringify(validatedItems.map(i => ({ 
          name: i.name, 
          licenseType: i.licenseType 
        })))
      },
      customer_email: req.body.email || undefined
    });

    console.log('Stripe session created:', session.id);
    
    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe session creation failed:', error.message);
    return res.status(400).json({ error: error.message });
  }
};
