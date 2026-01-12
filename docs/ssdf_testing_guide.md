# SSDF Testing Guide

Comprehensive testing strategy for frontend, backend, and payment integration.

---

## Frontend Testing

### Manual Testing Checklist

#### Page Load & Display
- [ ] Page loads without JavaScript errors (check console)
- [ ] All sections render correctly (hero, pricing, projects, footer)
- [ ] GitHub configuration form is visible
- [ ] Cart button shows count of 0 initially
- [ ] Navigation links work
- [ ] Responsive design works on mobile (test with DevTools)

#### GitHub Integration
- [ ] **Test 1: Valid Repository**
  - Username: `CreoDAMO`
  - Repo: `workflow-yaml-fixer-pro`
  - Expected: Project card loads with details, stats, and pricing
  
- [ ] **Test 2: Invalid Repository**
  - Username: `CreoDAMO`
  - Repo: `nonexistent-repo-12345`
  - Expected: Error message displays

- [ ] **Test 3: Rate Limiting**
  - Make 60+ requests without token
  - Expected: Rate limit error with suggestion to add token

- [ ] **Test 4: With GitHub Token**
  - Add valid personal access token
  - Expected: Higher rate limit, token saved to localStorage

#### Cart Functionality
- [ ] **Test 5: Add to Cart**
  - Click "Add Commercial License"
  - Expected: Alert shows, cart count increases, item appears in cart

- [ ] **Test 6: Duplicate Prevention**
  - Add same item twice
  - Expected: Alert "already in your cart"

- [ ] **Test 7: Remove from Cart**
  - Click "Remove" button
  - Expected: Item removed, count decreases, total updates

- [ ] **Test 8: Clear Cart**
  - Click "Clear Cart"
  - Expected: Confirmation dialog, cart empties

- [ ] **Test 9: Cart Persistence**
  - Add items to cart
  - Refresh page
  - Expected: Cart items persist

- [ ] **Test 10: Empty Cart Display**
  - Clear all items
  - Expected: "Your cart is empty" message displays

#### Payment Integration
- [ ] **Test 11: Stripe Button Visibility**
  - Add items to cart
  - Open cart
  - Expected: "Pay with Stripe" button visible

- [ ] **Test 12: PayPal Button Rendering**
  - Cart with items
  - Expected: PayPal buttons render below Stripe button

- [ ] **Test 13: Price Calculation**
  - Add multiple items
  - Expected: Total calculates correctly
  - Workflow YAML Fixer Pro Commercial = $499
  - Default Commercial = $299

#### Legal Pages
- [ ] **Test 14: Privacy Policy**
  - Click "Privacy Policy" in footer
  - Expected: Modal opens with privacy content

- [ ] **Test 15: Terms of Service**
  - Click "Terms of Service"
  - Expected: Modal opens with terms content

- [ ] **Test 16: Refund Policy**
  - Click "Refund Policy"
  - Expected: Modal opens with refund content

- [ ] **Test 17: Modal Closing**
  - Open any legal modal
  - Click X button OR click outside modal
  - Expected: Modal closes

---

## Backend Testing

### API Endpoint Tests

Use `curl` or Postman for these tests.

#### Health Check
```bash
# Test 18: Health Endpoint
curl https://your-backend.herokuapp.com/health

# Expected Response:
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

#### Stripe Checkout Session

```bash
# Test 19: Valid Checkout Session
curl -X POST https://your-backend.herokuapp.com/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "workflow-yaml-fixer-pro",
        "licenseType": "commercial",
        "price": 499
      }
    ]
  }'

# Expected: 200 OK with session ID
# {"id": "cs_test_..."}
```

```bash
# Test 20: Invalid Items (Empty Array)
curl -X POST https://your-backend.herokuapp.com/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"items": []}'

# Expected: 400 Bad Request
# {"error": "Invalid or empty items array"}
```

```bash
# Test 21: Missing Fields
curl -X POST https://your-backend.herokuapp.com/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"name": "test-project"}
    ]
  }'

# Expected: 400 Bad Request
# {"error": "Missing required fields: name, licenseType"}
```

```bash
# Test 22: Invalid SKU
curl -X POST https://your-backend.herokuapp.com/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "nonexistent-project",
        "licenseType": "platinum"
      }
    ]
  }'

# Expected: 400 Bad Request
# {"error": "Invalid SKU: nonexistent-project-platinum"}
```

#### PayPal Order Creation

```bash
# Test 23: Valid PayPal Order
curl -X POST https://your-backend.herokuapp.com/api/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "cart": [
      {
        "name": "workflow-yaml-fixer-pro",
        "licenseType": "commercial",
        "price": 499
      }
    ]
  }'

# Expected: 200 OK with order ID
# {"id": "PAYPAL_ORDER_ID"}
```

#### Rate Limiting

```bash
# Test 24: Rate Limit Enforcement
# Run this in a loop 60+ times:
for i in {1..60}; do
  curl -X POST https://your-backend.herokuapp.com/create-checkout-session \
    -H "Content-Type: application/json" \
    -d '{"items":[{"name":"test","licenseType":"commercial"}]}'
  echo "Request $i"
done

# Expected: After ~50 requests within 15 minutes:
# {"error": "Too many checkout attempts. Please try again later."}
```

---

## Payment Testing

### Stripe Test Cards

Use these in Stripe Checkout:

```
# Test 25: Successful Payment
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/30)
CVC: Any 3 digits (e.g., 123)
ZIP: Any (e.g., 12345)

Expected: Payment succeeds, webhook triggered, email sent
```

```
# Test 26: Card Declined
Card: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits

Expected: Payment fails with decline message
```

```
# Test 27: 3D Secure Required
Card: 4000 0027 6000 3184
Expiry: Any future date
CVC: Any 3 digits

Expected: Additional authentication required
```

### PayPal Sandbox Testing

1. Create sandbox accounts at https://developer.paypal.com/developer/accounts
2. Use sandbox buyer account credentials
3. Complete checkout flow

```
# Test 28: PayPal Checkout
- Click PayPal button
- Login with sandbox buyer account
- Approve payment
Expected: Order captured, email sent
```

---

## Webhook Testing

### Stripe Webhooks

```bash
# Test 29: Install Stripe CLI
# Download from: https://stripe.com/docs/stripe-cli

# Test 30: Listen to Webhooks Locally
stripe listen --forward-to localhost:4242/webhook/stripe

# In another terminal:
stripe trigger checkout.session.completed

# Expected: Webhook received, license email sent
# Check server logs for confirmation
```

### Manual Webhook Test

```bash
# Test 31: Webhook Signature Verification
curl -X POST https://your-backend.herokuapp.com/webhook/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid_signature" \
  -d '{
    "id": "evt_test",
    "type": "checkout.session.completed"
  }'

# Expected: 400 Bad Request
# "Webhook Error: No signatures found matching the expected signature"
```

---

## Email Testing

### Test Email Delivery

```bash
# Test 32: Manual Email Test
# Add this temporary endpoint to server.js:

app.get('/test-email', async (req, res) => {
  try {
    await sendLicenseEmail('test@example.com', [
      { name: 'test-project', licenseType: 'commercial' }
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

# Then:
curl https://your-backend.herokuapp.com/test-email

# Expected: Email received at test@example.com
# Check inbox and spam folder
```

---

## Integration Testing

### End-to-End Purchase Flow

#### Test 33: Complete Stripe Purchase

1. **Frontend:**
   - Load page
   - Enter GitHub repo details
   - Add commercial license to cart
   
2. **Cart:**
   - Verify item in cart
   - Verify price is $499 (not client-supplied value)
   - Click "Pay with Stripe"
   
3. **Stripe Checkout:**
   - Redirected to Stripe
   - Enter test card: 4242 4242 4242 4242
   - Complete purchase
   
4. **Success:**
   - Redirected to success page
   - Webhook fires
   - Check server logs: License email sent
   
5. **Email:**
   - Receive email with UUID license key
   - Verify format and content

**Expected Result:** Complete flow works without errors

#### Test 34: Complete PayPal Purchase

1. Add item to cart
2. Click PayPal button
3. Login with sandbox account
4. Approve payment
5. Order captured
6. Email received

**Expected Result:** Complete flow works without errors

---

## Error Handling Tests

```bash
# Test 35: Backend Unreachable
# Stop backend server, then:
# - Try to checkout with Stripe
# Expected: Friendly error message in frontend

# Test 36: Invalid Webhook Secret
# Update STRIPE_WEBHOOK_SECRET to wrong value
# Trigger webhook
# Expected: 400 error, event not processed

# Test 37: Email Server Down
# Set invalid EMAIL_PASS
# Complete purchase
# Expected: Payment succeeds, but email logged as failed
# Should not crash webhook handler
```

---

## Performance Testing

```bash
# Test 38: Concurrent Requests
# Install: npm install -g artillery

# Create artillery.yml:
config:
  target: "https://your-backend.herokuapp.com"
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - flow:
      - get:
          url: "/health"

# Run:
artillery run artillery.yml

# Expected: All requests succeed with <500ms response time
```

---

## Security Testing

```bash
# Test 39: SQL Injection Attempt
curl -X POST https://your-backend.herokuapp.com/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "test'; DROP TABLE users;--",
        "licenseType": "commercial"
      }
    ]
  }'

# Expected: Safely handled, no SQL injection (we use no SQL anyway)

# Test 40: XSS Attempt
curl -X POST https://your-backend.herokuapp.com/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "<script>alert('xss')</script>",
        "licenseType": "commercial"
      }
    ]
  }'

# Expected: Invalid SKU error, script not executed

# Test 41: Price Manipulation
curl -X POST https://your-backend.herokuapp.com/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "workflow-yaml-fixer-pro",
        "licenseType": "commercial",
        "price": 1
      }
    ]
  }'

# Expected: Client price IGNORED, server uses $499
```

---

## Accessibility Testing

### Manual Accessibility Checks

- [ ] **Test 42: Keyboard Navigation**
  - Tab through all interactive elements
  - Enter/Space activates buttons
  - Esc closes modals

- [ ] **Test 43: Screen Reader**
  - Use NVDA/JAWS/VoiceOver
  - All buttons have labels
  - Form inputs have labels
  - Modals announce properly

- [ ] **Test 44: Color Contrast**
  - Use browser DevTools or WAVE
  - All text meets WCAG AA standards

---

## Monitoring & Logging Tests

```bash
# Test 45: Log Output Format
# Trigger various actions, check logs:
heroku logs --tail --app your-app

# Expected log entries:
# - "Stripe session created"
# - "License email sent"
# - "PayPal order created"
# - Error logs include stack traces

# Test 46: Error Tracking
# Cause an intentional error
# Check that it's logged to error.log
cat error.log | grep "ERROR"
```

---

## Production Smoke Tests

Run these AFTER deploying to production:

```bash
# Test 47: Health Check (Production)
curl https://ssdf-backend-production.herokuapp.com/health
# Expected: 200 OK, all services true

# Test 48: HTTPS Enforcement
curl http://ssdf-backend-production.herokuapp.com/health
# Expected: Redirect to HTTPS

# Test 49: CORS Headers
curl -H "Origin: https://malicious-site.com" \
     https://ssdf-backend-production.herokuapp.com/health
# Expected: CORS headers restrict to your frontend URL only

# Test 50: $1 Test Purchase
# Make real $1 purchase with live card
# Verify email, then refund via Stripe dashboard
```

---

## Checklist Summary

Before going live, ensure ALL tests pass:

### Critical (Must Pass)
- [ ] Frontend loads without errors
- [ ] GitHub repos load correctly
- [ ] Cart persists across page loads
- [ ] Stripe checkout creates valid session
- [ ] PayPal order creates successfully
- [ ] Webhooks deliver reliably
- [ ] License emails send correctly
- [ ] Price validation works (server rejects client prices)
- [ ] Rate limiting prevents abuse
- [ ] HTTPS enabled

### Important (Should Pass)
- [ ] Error messages are user-friendly
- [ ] Mobile responsive design works
- [ ] Legal modals display
- [ ] Accessibility features work
- [ ] Logs are clear and actionable
- [ ] Health endpoint returns correct data

### Nice to Have
- [ ] Performance under load
- [ ] PayPal webhook configured
- [ ] Automated tests
- [ ] Monitoring/alerting setup

---

**Last Updated:** January 11, 2026
**Next Review:** After first 100 transactions
