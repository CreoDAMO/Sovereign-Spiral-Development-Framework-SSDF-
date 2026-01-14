// api/paypal/create-order.js
// PayPal order creation for Vercel serverless

const paypal = require('@paypal/checkout-server-sdk');

// SKU Price Map
const PRICE_MAP = {
  'workflow-yaml-fixer-pro-commercial': 499,
  'workflow-yaml-fixer-pro-enterprise': 999,
  'default-commercial': 299,
  'default-enterprise': 799
};

// PayPal Environment Setup
function getPayPalClient() {
  const environment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );
  
  return new paypal.core.PayPalHttpClient(environment);
}

function validateAndMapItems(cart) {
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    throw new Error('Invalid or empty cart array');
  }

  return cart.map(item => {
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
      price: price
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

  try {
    const validatedItems = validateAndMapItems(req.body.cart);

    let total = 0;
    const items = validatedItems.map(item => {
      total += item.price;
      return {
        name: `${item.name} - ${item.licenseType} License`,
        unit_amount: {
          currency_code: 'USD',
          value: item.price.toFixed(2)
        },
        quantity: '1'
      };
    });

    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: total.toFixed(2)
            }
          }
        },
        items: items
      }],
      application_context: {
        brand_name: 'Sovereign Spiral Development Framework',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL || req.headers.origin}/success`,
        cancel_url: `${process.env.FRONTEND_URL || req.headers.origin}/cancel`
      }
    });

    const client = getPayPalClient();
    const order = await client.execute(request);
    
    console.log('PayPal order created:', order.result.id);
    
    return res.status(200).json({ id: order.result.id });
  } catch (error) {
    console.error('PayPal order creation failed:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
