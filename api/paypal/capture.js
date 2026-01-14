// api/paypal/capture.js
// PayPal order capture for Vercel serverless

const paypal = require('@paypal/checkout-server-sdk');
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

async function sendLicenseEmail(to, items) {
  const licenses = items.map(item => ({
    project: item.project,
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

  const orderID = req.query.orderID || req.body.orderID;
  
  if (!orderID) {
    return res.status(400).json({ error: 'Order ID required' });
  }

  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const client = getPayPalClient();
    const capture = await client.execute(request);
    
    const payerEmail = capture.result.payer?.email_address ||
                      capture.result.purchase_units[0]?.payee?.email_address;

    if (!payerEmail) {
      console.error('PayPal order missing email:', orderID);
      return res.status(500).json({
        error: 'Payment processed but email delivery failed. Contact support with order ID: ' + orderID
      });
    }

    const items = capture.result.purchase_units[0]?.items || [];
    const formattedItems = items.map(item => ({
      project: item.name.split(' - ')[0],
      licenseType: item.name.includes('Enterprise') ? 'enterprise' : 'commercial'
    }));

    try {
      await sendLicenseEmail(payerEmail, formattedItems);
      console.log('PayPal payment processed:', orderID);
    } catch (emailError) {
      console.error('License email failed for PayPal payment:', {
        orderId: orderID,
        error: emailError.message
      });
    }

    return res.status(200).json(capture.result);
  } catch (error) {
    console.error('PayPal capture failed:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
