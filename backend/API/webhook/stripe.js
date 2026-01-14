// api/webhook/stripe.js
// Stripe webhook handler for Vercel serverless

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Idempotency tracking (in-memory, resets on cold start)
// For production at scale, use Redis or a database
const processedEvents = new Set();

async function sendLicenseEmail(to, items) {
  const licenses = items.map(item => ({
    project: item.name || item.project,
    licenseKey: uuidv4(),
    licenseType: item.licenseType
  }));

  const emailBody = `
Thank you for your purchase from Sovereign Spiral Development Framework!

Your License Information:
${licenses.map(l => `
Project: ${l.project}
License Type: ${l.licenseType}
License Key: ${l.licenseKey}
`).join('\n---\n')}

These license keys grant you the rights specified in your ${licenses[0].licenseType} license agreement.

All projects remain available under MIT License at https://github.com/CreoDAMO

For support, contact support@ssdf.work.gd

Best regards,
Sovereign Spiral Team
  `.trim();

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'commercial@ssdf.work.gd',
      to: to,
      subject: 'Your SSDF License Keys - Sovereign Spiral',
      text: emailBody
    });
    console.log('License email sent to:', to);
    return licenses;
  } catch (error) {
    console.error('Failed to send license email:', error.message);
    throw error;
  }
}

module.exports = async (req, res) => {
  // Webhooks need raw body
  const sig = req.headers['stripe-signature'];
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'stripe-signature, Content-Type');
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let event;

  try {
    // Get raw body
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency check
  if (processedEvents.has(event.id)) {
    console.log('Duplicate webhook event:', event.id);
    return res.status(200).json({ received: true, duplicate: true });
  }
  processedEvents.add(event.id);

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_email || session.customer_details?.email;

    if (!customerEmail) {
      console.error('No email in Stripe session:', session.id);
      return res.status(400).json({ error: 'No customer email available' });
    }

    try {
      const items = session.metadata.items ? JSON.parse(session.metadata.items) : [];
      await sendLicenseEmail(customerEmail, items);
      console.log('Stripe payment processed:', session.id);
    } catch (error) {
      console.error('License delivery failed for Stripe payment:', {
        sessionId: session.id,
        error: error.message
      });
      // Don't fail the webhook - log for manual follow-up
    }
  }

  return res.status(200).json({ received: true });
};
