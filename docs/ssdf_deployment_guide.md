# SSDF Production Deployment Guide

Complete step-by-step guide for deploying SSDF to production.

---

## Prerequisites

### Required Accounts

1. **Stripe Account** - https://stripe.com
   - Create account
   - Get publishable key and secret key
   - Set up webhook endpoint

2. **PayPal Developer Account** - https://developer.paypal.com
   - Create app in dashboard
   - Get Client ID and Secret
   - Optional: Set up webhooks

3. **Heroku Account** (or alternative hosting) - https://heroku.com
   - Free tier sufficient for initial deployment
   - Install Heroku CLI

4. **Email Service**
   - Gmail with App Password (development)
   - SendGrid/Postmark/AWS SES (production recommended)

5. **GitHub Account**
   - For repository hosting
   - Optional: GitHub Pages for frontend

---

## Part 1: Backend Deployment

### Step 1: Prepare Backend Files

```bash
# Create backend directory
mkdir ssdf-backend
cd ssdf-backend

# Initialize npm
npm init -y

# Install dependencies
npm install express stripe @paypal/checkout-server-sdk nodemailer uuid express-rate-limit winston cors dotenv

# Install dev dependencies
npm install --save-dev nodemon eslint
```

### Step 2: Create Configuration Files

Create `.env` file (use `.env.example` as template):

```bash
# Copy environment template
cp .env.example .env

# Edit with your actual values
nano .env
```

Fill in ALL values:
- `STRIPE_SECRET_KEY` - From Stripe Dashboard → Developers → API Keys
- `STRIPE_WEBHOOK_SECRET` - Created after setting up webhook (see below)
- `PAYPAL_CLIENT_ID` - From PayPal Developer Dashboard
- `PAYPAL_CLIENT_SECRET` - From PayPal Developer Dashboard
- `EMAIL_USER` - Your email address
- `EMAIL_PASS` - App password (NOT your regular password)
- `FRONTEND_URL` - Where your frontend will be hosted

### Step 3: Deploy to Heroku

```bash
# Make deploy script executable
chmod +x deploy.sh

# Set environment variables in your terminal
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...
export PAYPAL_CLIENT_ID=...
export PAYPAL_CLIENT_SECRET=...
export EMAIL_USER=your-email@gmail.com
export EMAIL_PASS=your-app-password
export EMAIL_FROM=commercial@ssdf.work.gd
export FRONTEND_URL=https://your-frontend.github.io

# Deploy to staging
./deploy.sh staging

# Or deploy to production
./deploy.sh production
```

### Step 4: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://ssdf-backend-staging.herokuapp.com/webhook/stripe`
4. Select events: `checkout.session.completed`
5. Copy the signing secret
6. Update Heroku config:
   ```bash
   heroku config:set STRIPE_WEBHOOK_SECRET=whsec_... --app ssdf-backend-staging
   ```

### Step 5: Test Backend

```bash
# Check health endpoint
curl https://ssdf-backend-staging.herokuapp.com/health

# Should return:
{
  "status": "ok",
  "timestamp": "2026-01-11T...",
  "version": "1.0.0",
  "services": {
    "stripe": true,
    "paypal": true,
    "email": true
  }
}
```

---

## Part 2: Frontend Deployment

### Option A: GitHub Pages (Recommended for Static Sites)

```bash
# In your frontend directory
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository
# Then:
git remote add origin https://github.com/YOUR_USERNAME/ssdf-frontend.git
git push -u origin main

# Enable GitHub Pages
# Repository → Settings → Pages
# Source: main branch, / (root)
```

### Option B: Netlify

1. Sign up at https://netlify.com
2. Connect GitHub repository
3. Build settings: None (it's static HTML)
4. Deploy!

### Option C: Vercel

```bash
npm install -g vercel
vercel --prod
```

### Step 6: Update Frontend Configuration

Edit `index.html` and update:

```javascript
const CONFIG = {
    stripePublishableKey: 'pk_live_YOUR_LIVE_KEY', // Change from test key
    backendUrl: 'https://ssdf-backend-production.herokuapp.com',
    githubTokenKey: 'ssdf_github_token',
    cartStorageKey: 'ssdf_cart'
};
```

Also update PayPal client ID in the script tag:
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_LIVE_CLIENT_ID&currency=USD"></script>
```

---

## Part 3: Email Configuration

### Gmail (Development/Testing)

1. Enable 2-Factor Authentication on your Google account
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
3. Use in `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

### SendGrid (Production Recommended)

```bash
# Install SendGrid
npm install @sendgrid/mail

# Update server.js transporter:
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

# .env configuration:
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your_api_key_here
```

---

## Part 4: Testing

### Test Stripe Payment

1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC
4. Any ZIP code

### Test PayPal Payment

1. Use PayPal sandbox credentials
2. Or create test accounts in PayPal Developer Dashboard

### Test Webhook Delivery

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:4242/webhook/stripe

# In another terminal, trigger test event:
stripe trigger checkout.session.completed
```

---

## Part 5: Production Checklist

### Security

- [ ] All environment variables are set correctly
- [ ] Using LIVE Stripe keys (not test)
- [ ] Using LIVE PayPal credentials
- [ ] HTTPS enabled on frontend
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Webhook signatures verified

### Functionality

- [ ] Health check endpoint returns 200
- [ ] Can create Stripe checkout session
- [ ] Can create PayPal order
- [ ] Webhooks are received and processed
- [ ] License emails are sent successfully
- [ ] Cart persists in localStorage
- [ ] Projects load from GitHub
- [ ] Legal pages display correctly

### Monitoring

- [ ] Heroku logs configured: `heroku logs --tail`
- [ ] Error logging to file (check `error.log`)
- [ ] Email delivery confirmed
- [ ] Set up uptime monitoring (e.g., UptimeRobot)

### Documentation

- [ ] README updated with deployment URL
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Contact emails functional

---

## Part 6: Going Live

### Final Steps

1. **Switch to Live Keys**
   ```bash
   # Update Heroku config for production app
   heroku config:set \
     STRIPE_SECRET_KEY=sk_live_... \
     PAYPAL_CLIENT_ID=live_client_id \
     --app ssdf-backend-production
   ```

2. **Update Frontend**
   - Change `pk_test_...` to `pk_live_...`
   - Update `backendUrl` to production URL
   - Update PayPal script to use live client ID

3. **Configure Live Webhooks**
   - Stripe: Update webhook URL to production
   - PayPal: Configure webhook in live dashboard

4. **Test End-to-End**
   - Make a real $1 purchase
   - Verify email received
   - Check license key generated
   - Refund the test purchase

5. **Monitor First Week**
   ```bash
   # Watch logs
   heroku logs --tail --app ssdf-backend-production
   
   # Check error rates
   heroku ps --app ssdf-backend-production
   ```

---

## Troubleshooting

### "Webhook signature verification failed"

**Cause:** Wrong webhook secret

**Fix:**
```bash
# Get correct secret from Stripe Dashboard
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_... --app your-app
```

### "Email delivery failed"

**Cause:** Invalid email credentials or Gmail blocking

**Fix:**
1. Verify app password is correct
2. Check Gmail "Less secure app access" settings
3. Consider switching to SendGrid for production

### "PayPal order creation failed"

**Cause:** Mismatch between sandbox/live environment

**Fix:**
```javascript
// In server.js, verify:
const paypalEnvironment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(...)  // For live
    : new paypal.core.SandboxEnvironment(...);  // For testing
```

### "Health check failed"

**Cause:** App not starting or crashed

**Fix:**
```bash
# Check logs
heroku logs --tail --app your-app

# Restart app
heroku restart --app your-app

# Check dyno status
heroku ps --app your-app
```

---

## Scaling & Optimization

### When You Grow

1. **Upgrade Heroku Dyno**
   ```bash
   heroku ps:scale web=1:standard-1x
   ```

2. **Add Redis for Idempotency**
   ```bash
   heroku addons:create heroku-redis:mini
   ```

3. **Database for License Storage**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **CDN for Frontend**
   - Use Cloudflare (free tier)
   - Cache static assets

5. **Monitoring**
   - Heroku Metrics (built-in)
   - New Relic (free tier)
   - Sentry for error tracking

---

## Support

- Email: support@ssdf.work.gd
- Documentation: https://github.com/CreoDAMO/ssdf
- Issues: GitHub Issues

---

**Last Updated:** January 11, 2026
