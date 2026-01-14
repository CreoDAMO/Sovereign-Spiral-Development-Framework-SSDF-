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
  

---

## Project Structure for Vercel

```
Sovereign-Spiral-Development-Framework-SSDF-/
├── frontend/
│   ├── index.html
│   ├── success.html
│   └── cancel.html
├── api/
│   ├── health.js
│   ├── create-checkout-session.js
│   ├── webhook/
│   │   └── stripe.js
│   └── paypal/
│       ├── create-order.js
│       └── capture.js
├── vercel.json
├── package.json
├── .env.example
└── README.md
```

---

## Step 1: Prerequisites

### Required Accounts

1. **Vercel Account** - https://vercel.com/signup
   - Sign up with GitHub (recommended)
   - Free tier is sufficient

2. **Stripe Account** - https://stripe.com
   - Get API keys (test and live)
   - Set up webhook

3. **PayPal Developer Account** - https://developer.paypal.com
   - Create app
   - Get Client ID and Secret

4. **Email Service**
   - Gmail with App Password (development)
   - SendGrid recommended for production

### Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

---

## Step 2: Prepare Your Repository

### File Organization

```bash
# Create the structure
mkdir -p frontend api/webhook api/paypal

# Move files
mv index.html success.html cancel.html frontend/

# Create API files (copy from artifacts)
# - api/health.js
# - api/create-checkout-session.js
# - api/webhook/stripe.js
# - api/paypal/create-order.js
# - api/paypal/capture.js

# Create configuration files
# - vercel.json
# - package.json
```

### Update Frontend URLs

Edit `frontend/index.html` and update:

```javascript
const CONFIG = {
    stripePublishableKey: 'pk_test_your_key', // Update with your key
    backendUrl: '', // Leave empty - Vercel uses relative URLs
    githubTokenKey: 'ssdf_github_token',
    cartStorageKey: 'ssdf_cart'
};
```

**Important:** With Vercel, backend and frontend are on the same domain, so you can use relative URLs like `/api/health` instead of full URLs.

---

## Step 3: Configure Environment Variables

### Create `.env` Locally (for testing)

```bash
# Create .env file
cat > .env << 'EOF'
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=commercial@ssdf.work.gd

# Frontend URL (will be auto-set by Vercel)
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
EOF
```

### Test Locally

```bash
# Install dependencies
npm install

# Run locally
vercel dev

# Test endpoints
curl http://localhost:3000/api/health
```

---

## Step 4: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Setup Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel auto-detects configuration from `vercel.json`
   - Click "Deploy"

3. **Configure Environment Variables:**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from your `.env` file:
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `PAYPAL_CLIENT_ID`
     - `PAYPAL_CLIENT_SECRET`
     - `EMAIL_HOST`
     - `EMAIL_PORT`
     - `EMAIL_USER`
     - `EMAIL_PASS`
     - `EMAIL_FROM`
   - Set for: Production, Preview, Development

4. **Redeploy** (if needed):
   - Environment changes require redeployment
   - Go to Deployments → Click "..." → Redeploy

### Option B: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

When prompted:
- Set up and deploy: **Y**
- Which scope: Select your account
- Link to existing project: **N** (first time)
- What's your project's name: **ssdf**
- In which directory is your code: **./** (current directory)
- Want to override settings: **N**

---

## Step 5: Configure Stripe Webhook

1. **Get Your Vercel URL:**
   - After deployment: `https://your-project.vercel.app`
   - Or custom domain: `https://ssdf.work.gd`

2. **Add Webhook in Stripe:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://your-project.vercel.app/api/webhook/stripe`
   - Events to send: `checkout.session.completed`
   - Click "Add endpoint"

3. **Update Webhook Secret:**
   - Copy the signing secret (starts with `whsec_`)
   - In Vercel dashboard → Environment Variables
   - Update `STRIPE_WEBHOOK_SECRET` with new value
   - Redeploy

---

## Step 6: Update Frontend Configuration

After deployment, update `frontend/index.html`:

```javascript
const CONFIG = {
    stripePublishableKey: 'pk_live_your_live_key', // Use live key for production
    backendUrl: '', // Empty = same domain (recommended)
    githubTokenKey: 'ssdf_github_token',
    cartStorageKey: 'ssdf_cart'
};
```

And update PayPal client ID:
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_LIVE_CLIENT_ID&currency=USD&components=buttons"></script>
```

Commit and push changes - Vercel auto-deploys!

---

## Step 7: Custom Domain (Optional)

### Add Custom Domain

1. **In Vercel Dashboard:**
   - Project → Settings → Domains
   - Add domain: `ssdf.site`

2. **Configure DNS:**
   - Add CNAME record:
     ```
     Type: CNAME
     Name: @ (or www)
     Value: cname.vercel-dns.com
     ```

3. **Wait for verification** (can take up to 48 hours)

4. **Update Environment Variables:**
   - Set `FRONTEND_URL=https://ssdf.site`
   - Redeploy

---

## Step 8: Testing

### Test Endpoints

```bash
# Health check
curl https://your-project.vercel.app/api/health

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

### Test Frontend

1. Visit `https://your-project.vercel.app`
2. Load projects from GitHub
3. Add item to cart
4. Test checkout with Stripe test card: `4242 4242 4242 4242`
5. Verify email delivery
6. Test PayPal flow

### Test Webhooks

```bash
# Use Stripe CLI
stripe listen --forward-to https://your-project.vercel.app/api/webhook/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

---

## Vercel-Specific Features

### Automatic Deployments

Every `git push` to main triggers:
- Automatic build
- Serverless function deployment
- CDN cache update
- Preview URL generation

### Preview Deployments

Every Pull Request gets:
- Unique preview URL
- Isolated environment
- Same environment variables
- Test before merging

### Monitoring

Vercel provides:
- Real-time logs
- Function metrics
- Error tracking
- Performance insights

Access via: Dashboard → Your Project → Monitoring

---

## Environment Management

### Development
```bash
vercel dev
# Runs at http://localhost:3000
```

### Preview (Staging)
```bash
vercel
# Deploys to preview URL
```

### Production
```bash
vercel --prod
# Deploys to production domain
```

---

## Troubleshooting

### "Function exceeded maximum size"

**Problem:** Serverless function too large

**Solution:**
```bash
# Reduce node_modules size
npm install --production

# Or split large functions into smaller ones
```

### "Environment variable not found"

**Problem:** Missing env vars in Vercel

**Solution:**
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Add missing variables
4. Redeploy

### "Webhook signature verification failed"

**Problem:** Wrong webhook secret

**Solution:**
1. Get correct secret from Stripe dashboard
2. Update `STRIPE_WEBHOOK_SECRET` in Vercel
3. Redeploy
4. Test webhook again

### "Email delivery failed"

**Problem:** Email credentials incorrect

**Solution:**
1. Verify `EMAIL_USER` and `EMAIL_PASS`
2. For Gmail, use App Password (not regular password)
3. Consider SendGrid for production

### "CORS errors"

**Problem:** Cross-origin request blocked

**Solution:**
Already configured in `vercel.json` headers section. If issues persist:
```javascript
// Add to each API function
res.setHeader('Access-Control-Allow-Origin', '*');
```

---

## Performance Optimization

### Enable Caching

Already configured in `vercel.json`. Frontend assets cached automatically.

### Edge Functions (Future)

For ultra-fast responses, consider upgrading critical endpoints to Edge Functions:

```javascript
// Add to function file
export const config = {
  runtime: 'edge',
};
```

### Database Connection Pooling

If you add a database later, use connection pooling for serverless:
- Vercel Postgres (built-in pooling)
- PlanetScale (serverless-friendly)
- Supabase (auto-pooling)

---

## Scaling

### Free Tier Limits

- **Bandwidth:** 100GB/month
- **Function Executions:** 100GB-hours/month
- **Build Minutes:** 6000 minutes/month
- **Serverless Function Size:** 50MB compressed

### When to Upgrade

Upgrade to Pro ($20/month) when you need:
- More bandwidth
- Faster builds
- Team collaboration
- Advanced analytics
- Password protection

---

## Migration from Heroku

If you previously deployed to Heroku:

1. **Stop Heroku app** (optional - can run both)
2. **Update DNS** to point to Vercel
3. **Migrate environment variables** to Vercel
4. **Update webhook URLs** in Stripe/PayPal
5. **Test thoroughly**
6. **Delete Heroku app** (if desired)

---

## Monitoring & Logs

### View Logs

```bash
# Via CLI
vercel logs your-project.vercel.app

# Or in dashboard
# Project → Deployments → Click deployment → View Function Logs
```

### Add Custom Logging

```javascript
// In any API function
console.log('Custom log message', { data: 'here' });
console.error('Error occurred:', error);
```

Logs appear in Vercel dashboard under Functions → Logs.

---

## Security Best Practices

✅ **Never commit `.env`** - Use Vercel environment variables  
✅ **Use environment variables** for all secrets  
✅ **Enable HTTPS** - Automatic with Vercel  
✅ **Verify webhook signatures** - Already implemented  
✅ **Rate limit** - Implemented in functions  
✅ **Validate input** - All endpoints validate  
✅ **Keep dependencies updated** - `npm audit` regularly  

---

## Backup & Recovery

### Rollback Deployment

In Vercel dashboard:
1. Go to Deployments
2. Find previous successful deployment
3. Click "..." → Promote to Production

### Export Configuration

```bash
# Download environment variables
vercel env pull .env.production

# Save deployment settings
vercel project ls
```

---

## Cost Estimates

### Free Tier (Most Users)
- $0/month
- Sufficient for small to medium projects
- 100GB bandwidth
- Unlimited deployments

### Pro Tier ($20/month)
- For growing businesses
- 1TB bandwidth
- Team features
- Advanced analytics

### Enterprise (Custom)
- For large organizations
- Unlimited everything
- Dedicated support
- SLA guarantees

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure environment variables
3. ✅ Set up Stripe webhook
4. ✅ Test payment flow
5. ✅ Add custom domain (optional)
6. ✅ Monitor performance
7. ✅ Set up alerts (optional)

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Community:** https://github.com/vercel/vercel/discussions
- **SSDF Support:** support@ssdf.work.gd

---

## Advantages Over Heroku

| Feature | Heroku | Vercel |
|---------|--------|--------|
| **Free Tier** | Limited (sleeps) | ✅ Generous |
| **Setup** | Manual | ✅ Auto-detect |
| **Frontend Hosting** | Separate service | ✅ Built-in |
| **Auto-deploy** | Manual | ✅ Git push |
| **Global CDN** | Add-on | ✅ Included |
| **Serverless** | No | ✅ Yes |
| **Cost (small)** | $7-25/mo | ✅ $0 |

---

**Congratulations! Your Sovereign Spiral Development Framework is now deployed on Vercel! 🎉**

**Last Updated:** January 11, 2026  
**Version:** 1.0.0  
**Platform:** Vercel Serverless

---

## Pricing

Example pricing structure (customizable):

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | MIT License, personal/internal use |
| **Commercial** | $299-$499 | White-label, no attribution, proprietary use |
| **Enterprise** | $799-$999 | Priority support, custom development, SLA |


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
- **Email:** support@ssdf.site
- **Commercial:** commercial@ssdf.site

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

**Commercial Inquiries:** commercial@ssdf.site  
**Support:** support@ssdf.site
**Security:** security@ssdf.site

---

Made with ❤️ by the SSDF Team

**Remember:** MIT license always applies. Commercial licensing is optional and adds rights—it never restricts freedom.
