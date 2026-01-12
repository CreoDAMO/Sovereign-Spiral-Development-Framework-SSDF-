// SSDF Backend - Production Ready
// Install: npm i express stripe @paypal/checkout-server-sdk nodemailer uuid express-rate-limit winston cors dotenv

require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const cors = require('cors');

const app = express();

// Logging configuration
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Webhook endpoints need raw body
app.use('/webhook', express.raw({ type: 'application/json' }));

// Regular JSON parsing for other endpoints
app.use(express.json());

// Rate limiting
const checkoutLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    message: { error: 'Too many checkout attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const webhookLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    skipSuccessfulRequests: true
});

// PayPal Environment Setup
const paypalEnvironment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);

const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

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

// Verify email configuration on startup
transporter.verify((error, success) => {
    if (error) {
        logger.error('Email configuration error:', error);
    } else {
        logger.info('Email server is ready');
    }
});

// SKU Price Map (Server-side authority)
const PRICE_MAP = {
    'workflow-yaml-fixer-pro-commercial': 499,
    'workflow-yaml-fixer-pro-enterprise': 999,
    // Add more SKUs as needed
    'default-commercial': 299,
    'default-enterprise': 799
};

// Idempotency tracking (use Redis in production)
const processedEvents = new Set();

// Helper: Send license email
async function sendLicenseEmail(to, items) {
    const licenses = items.map(item => ({
        project: item.name || item.project,
        licenseKey: uuidv4(),
        licenseType: item.licenseType
    }));

    const emailBody = `
Thank you for your purchase from SSDF!

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
SSDF Team
    `.trim();

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'commercial@ssdf.work.gd',
            to: to,
            subject: 'Your SSDF License Keys',
            text: emailBody
        });
        logger.info('License email sent', { to, licenses: licenses.map(l => l.project) });
        return licenses;
    } catch (error) {
        logger.error('Failed to send license email', { to, error: error.message });
        throw error;
    }
}

// Helper: Validate and map items to SKUs
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

        // Server-side price is authority; ignore client price
        return {
            name: item.name,
            licenseType: item.licenseType,
            price: price,
            sku: sku
        };
    });
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
            stripe: !!process.env.STRIPE_SECRET_KEY,
            paypal: !!process.env.PAYPAL_CLIENT_ID,
            email: !!process.env.EMAIL_USER
        }
    });
});

// Stripe Checkout Session
app.post('/create-checkout-session', checkoutLimiter, async (req, res) => {
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
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: {
                items: JSON.stringify(validatedItems.map(i => ({ name: i.name, licenseType: i.licenseType })))
            },
            customer_email: req.body.email || undefined
        });

        logger.info('Stripe session created', { sessionId: session.id, items: validatedItems.map(i => i.name) });
        res.json({ id: session.id });
    } catch (error) {
        logger.error('Stripe session creation failed', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});

// Stripe Webhook
app.post('/webhook/stripe', webhookLimiter, async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        logger.error('Webhook signature verification failed', { error: err.message });
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Idempotency check
    if (processedEvents.has(event.id)) {
        logger.info('Duplicate webhook event', { eventId: event.id });
        return res.json({ received: true, duplicate: true });
    }
    processedEvents.add(event.id);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.customer_details?.email;

        if (!customerEmail) {
            logger.error('No email in Stripe session', { sessionId: session.id });
            return res.status(400).json({ error: 'No customer email available' });
        }

        try {
            const items = session.metadata.items ? JSON.parse(session.metadata.items) : [];
            await sendLicenseEmail(customerEmail, items);
            logger.info('Stripe payment processed', { sessionId: session.id, email: customerEmail });
        } catch (error) {
            logger.error('License delivery failed for Stripe payment', {
                sessionId: session.id,
                error: error.message
            });
            // Don't fail the webhook - log for manual follow-up
        }
    }

    res.json({ received: true });
});

// PayPal Create Order
app.post('/api/paypal/create-order', checkoutLimiter, async (req, res) => {
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
                brand_name: 'SSDF',
                landing_page: 'BILLING',
                user_action: 'PAY_NOW',
                return_url: `${process.env.FRONTEND_URL}/success`,
                cancel_url: `${process.env.FRONTEND_URL}/cancel`
            }
        });

        const order = await paypalClient.execute(request);
        logger.info('PayPal order created', { orderId: order.result.id, total });
        res.json({ id: order.result.id });
    } catch (error) {
        logger.error('PayPal order creation failed', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// PayPal Capture Order
app.post('/api/paypal/orders/:orderID/capture', async (req, res) => {
    const request = new paypal.orders.OrdersCaptureRequest(req.params.orderID);
    request.requestBody({});

    try {
        const capture = await paypalClient.execute(request);
        const payerEmail = capture.result.payer?.email_address ||
                          capture.result.purchase_units[0]?.payee?.email_address;

        if (!payerEmail) {
            logger.error('PayPal order missing email', { orderId: req.params.orderID });
            return res.status(500).json({
                error: 'Payment processed but email delivery failed. Contact support with order ID: ' + req.params.orderID
            });
        }

        const items = capture.result.purchase_units[0]?.items || [];
        const formattedItems = items.map(item => ({
            project: item.name.split(' - ')[0],
            licenseType: item.name.includes('Enterprise') ? 'enterprise' : 'commercial'
        }));

        try {
            await sendLicenseEmail(payerEmail, formattedItems);
            logger.info('PayPal payment processed', { orderId: req.params.orderID, email: payerEmail });
        } catch (emailError) {
            logger.error('License email failed for PayPal payment', {
                orderId: req.params.orderID,
                error: emailError.message
            });
        }

        res.json(capture.result);
    } catch (error) {
        logger.error('PayPal capture failed', { orderId: req.params.orderID, error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// PayPal Webhook (optional but recommended for production)
app.post('/webhook/paypal', webhookLimiter, async (req, res) => {
    // Implement PayPal webhook verification here
    // See: https://developer.paypal.com/docs/api/webhooks/v1/
    logger.info('PayPal webhook received', { eventType: req.body.event_type });
    res.json({ received: true });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info('Environment:', process.env.NODE_ENV || 'development');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
