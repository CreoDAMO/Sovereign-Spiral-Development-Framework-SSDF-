# Sovereign-Spiral-Development-Framework-SSDF-


A production-ready framework for distributing open-source tools with optional commercial licensing.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## What is SSDF?

SSDF provides a complete, honest system for:
- Publishing software tools under MIT license (always free)
- Offering commercial licensing as optional rights expansion
- Processing payments via Stripe and PayPal
- Automated license key delivery
- Dynamic product catalog from GitHub repositories

**This is NOT:** DRM, license enforcement, a SaaS platform, or a blockchain project.

**This IS:** A transparent storefront with secure payment processing and honest licensing.

---

## Core Principles

1. **MIT Always Applies** - Commercial licenses add rights, never remove freedoms
2. **Server Has Authority** - Prices validated server-side; client cannot manipulate
3. **Static First** - Frontend is pure HTML/JS/CSS; backend only for payments
4. **No Dark Patterns** - Free use never blocked; checkout is explicit and reversible
5. **Production Ready** - Rate limiting, logging, error handling, idempotency built-in

---

## Quick Start

### Prerequisites

- Node.js ≥18
- Stripe account
- PayPal developer account
- Email service (Gmail or SendGrid)
- Heroku account (or alternative hosting)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/ssdf.git
cd ssdf

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Deployment

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh production
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete instructions.

---

## Project Structure

```
ssdf/
├── frontend/
│   ├── index.html                 # Main application (static)
│   ├── success.html               # Payment success page
│   └── cancel.html                # Payment canceled page
│
├── backend/
│   ├── server.js                  # Express server with payment logic
│   ├── package.json               # Dependencies
│   ├── .env.example               # Environment variables template
│   └── deploy.sh                  # Deployment script
│
├── docs/
│   ├── DEPLOYMENT_GUIDE.md        # Complete deployment walkthrough
│   ├── TESTING_GUIDE.md           # All testing scenarios
│   ├── API_DOCUMENTATION.md       # Endpoint specifications
│   └── SECURITY.md                # Security policy
│
├── README.md                      # This file
├── CONTRIBUTING.md                # How to contribute
├── LICENSE                        # MIT License
└── CHANGELOG.md                   # Version history
```

---

## Features

### Frontend
✅ Dynamic GitHub repository loading  
✅ Optional GitHub token support (local-only storage)  
✅ Persistent shopping cart (`localStorage`)  
✅ Multi-item checkout  
✅ Stripe Checkout integration  
✅ PayPal Smart Buttons integration  
✅ Responsive design (mobile-first)  
✅ Legal pages (Privacy, Terms, Refund)  
✅ Accessibility (ARIA labels, keyboard navigation)  

### Backend
✅ Server-side price validation (SKU mapping)  
✅ Rate limiting (prevents abuse)  
✅ Webhook-only payment confirmation  
✅ Automated license key generation (UUID)  
✅ Email delivery (Nodemailer)  
✅ Structured logging (Winston)  
✅ Idempotent webhook handling  
✅ CORS protection  
✅ Health check endpoint  
✅ Graceful error handling  

---

## Tech Stack

**Frontend:**
- Vanilla HTML5 / CSS3 / JavaScript
- No frameworks, no build step
- Fully static-hostable

**Backend:**
- Node.js + Express
- Stripe SDK
- PayPal Checkout Server SDK
- Nodemailer
- Winston (logging)
- Express-rate-limit

**Deployment:**
- Frontend: GitHub Pages / Netlify / Vercel
- Backend: Heroku / Railway / Render
- Email: Gmail / SendGrid / Postmark

---

## How Licensing Works

All SSDF repositories remain **MIT licensed** on GitHub.

Commercial licenses provide:
- White-label rights (remove attribution)
- Proprietary product embedding
- Legal indemnification
- Enterprise: Priority support + custom development

**Users who do nothing still retain full MIT rights.**

This is deliberate and by design.

---

## Payments Flow

### Stripe
1. Frontend sends selected SKUs
2. Backend maps SKU → price (server-side validation)
3. Stripe Checkout handles payment
4. Webhook confirms payment
5. License keys emailed automatically

### PayPal
1. Cart items sent as order intent
2. Order created server-side
3. Payment approved client-side
4. Capture confirmed server-side
5. License keys emailed automatically

All prices are validated server-side. Client-supplied prices are ignored.

---

## Security

**Server-Side Validation:**
- All SKUs and prices validated against `PRICE_MAP`
- Client cannot manipulate checkout amounts

**Webhook Verification:**
- Stripe: Signature verification with `stripe.webhooks.constructEvent`
- PayPal: Recommended webhook verification (optional but suggested)

**Rate Limiting:**
- Checkout endpoints: 50 requests / 15 minutes per IP
- Webhook endpoints: 100 requests / minute

**Data Privacy:**
- GitHub tokens stored locally only (never transmitted)
- Cart data in `localStorage` (no server storage)
- No tracking scripts or analytics

**HTTPS Required:**
- All production deployments must use HTTPS
- Webhook signatures validated
- CORS configured to restrict origins

See [SECURITY.md](docs/SECURITY.md) for full security policy.

---

## API Endpoints

### `GET /health`
Health check and service status

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-11T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "stripe": true,
    "paypal": true,
    "email": true
  }
}
```

### `POST /create-checkout-session`
Create Stripe Checkout session

**Request:**
```json
{
  "items": [
    {
      "name": "workflow-yaml-fixer-pro",
      "licenseType": "commercial",
      "price": 499
    }
  ]
}
```

**Response:**
```json
{
  "id": "cs_test_..."
}
```

### `POST /api/paypal/create-order`
Create PayPal order

**Request:**
```json
{
  "cart": [
    {
      "name": "workflow-yaml-fixer-pro",
      "licenseType": "commercial",
      "price": 499
    }
  ]
}
```

**Response:**
```json
{
  "id": "PAYPAL_ORDER_ID"
}
```

See [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for complete API reference.

---

## Testing

Complete testing guide available in [TESTING_GUIDE.md](docs/TESTING_GUIDE.md).

### Quick Test

```bash
# Test health endpoint
curl https://your-backend.herokuapp.com/health

# Test Stripe checkout (with test data)
curl -X POST https://your-backend.herokuapp.com/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"items":[{"name":"test-project","licenseType":"commercial","price":299}]}'
```

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

---

## Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Using LIVE Stripe/PayPal keys (not test)
- [ ] Webhooks configured and verified
- [ ] Email delivery tested
- [ ] HTTPS enabled
- [ ] Rate limiting active
- [ ] Health check returns 200
- [ ] End-to-end purchase tested
- [ ] License email received
- [ ] Logs configured
- [ ] Monitoring setup (optional but recommended)

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for step-by-step instructions.

---

## Pricing

Example pricing structure (customizable):

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | MIT License, personal/internal use |
| **Commercial** | $299-$499 | White-label, no attribution, proprietary use |
| **Enterprise** | $799-$999 | Priority support, custom development, SLA |

Server-side price map in `server.js`:
```javascript
const PRICE_MAP = {
  'workflow-yaml-fixer-pro-commercial': 499,
  'workflow-yaml-fixer-pro-enterprise': 999,
  'default-commercial': 299,
  'default-enterprise': 799
};
```

---

## Environment Variables

Required variables (see `.env.example`):

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=commercial@ssdf.work.gd

# General
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
PORT=4242
LOG_LEVEL=info
```

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

### Good Contributions:
- Bug fixes
- Security improvements
- Documentation enhancements
- Payment provider updates
- Accessibility improvements

### Not Accepted:
- UI frameworks (keep vanilla)
- License enforcement/DRM
- Tracking/analytics
- Blockchain integrations

---

## Monitoring & Maintenance

### Logs

```bash
# View Heroku logs
heroku logs --tail --app your-app

# Check error log file
cat error.log | grep ERROR

# Winston logs to:
# - combined.log (all logs)
# - error.log (errors only)
```

### Monitoring

Recommended services (free tiers available):
- **Uptime:** UptimeRobot, Pingdom
- **Errors:** Sentry, Rollbar
- **Performance:** New Relic, Scout APM
- **Analytics:** Self-hosted Plausible (privacy-friendly)

---

## Roadmap

### v1.0 (Current)
- ✅ Stripe + PayPal integration
- ✅ Automated license delivery
- ✅ GitHub repository loading
- ✅ Rate limiting
- ✅ Production deployment

### v1.1 (Planned)
- [ ] Automated testing suite
- [ ] License key verification API
- [ ] Multi-currency support
- [ ] Invoice generation
- [ ] Customer dashboard

### v2.0 (Future)
- [ ] Subscription licensing
- [ ] Volume discounts
- [ ] Affiliate system
- [ ] Advanced analytics

---

## Support

- **Documentation:** This README + [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/ssdf/issues)
- **Email:** support@ssdf.work.gd
- **Commercial:** commercial@ssdf.work.gd

---

## License

### Code
MIT License - see [LICENSE](LICENSE)

### Commercial Licenses
Available separately for projects built with SSDF. See pricing section.

---

## Acknowledgments

Built with:
- [Stripe](https://stripe.com) - Payment processing
- [PayPal](https://paypal.com) - Alternative payments
- [Nodemailer](https://nodemailer.com) - Email delivery
- [Winston](https://github.com/winstonjs/winston) - Logging
- [Express](https://expressjs.com) - Web framework

---

## Status

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** January 11, 2026  
**Maintained:** Yes  

---

## Contact

**Commercial Inquiries:** commercial@ssdf.work.gd  
**Support:** support@ssdf.work.gd  
**Security:** security@ssdf.work.gd  

---

Made with ❤️ by the SSDF Team

**Remember:** MIT license always applies. Commercial licensing is optional and adds rights—it never restricts freedom.
