#!/bin/bash
#
# SSDF Quick Start Script
# Automates initial project setup
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════╗"
echo "║   SSDF Quick Start Setup                  ║"
echo "║   Secure Software Distribution Framework  ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}\n"

# Check Node.js
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Install from: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required (found: $(node -v))${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}\n"

# Create project structure
echo -e "${YELLOW}Creating project structure...${NC}"

# Create directories
mkdir -p ssdf-backend
mkdir -p ssdf-frontend
mkdir -p docs

echo -e "${GREEN}✅ Directories created${NC}\n"

# Backend setup
echo -e "${YELLOW}Setting up backend...${NC}"
cd ssdf-backend

# Create package.json
cat > package.json << 'EOF'
{
  "name": "ssdf-backend",
  "version": "1.0.0",
  "description": "SSDF Backend - Payment processing and license delivery",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 0"
  },
  "keywords": ["payments", "stripe", "paypal", "licensing"],
  "author": "SSDF",
  "license": "MIT",
  "dependencies": {
    "@paypal/checkout-server-sdk": "^1.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-rate-limit": "^6.7.0",
    "nodemailer": "^6.9.1",
    "stripe": "^12.0.0",
    "uuid": "^9.0.0",
    "winston": "^3.8.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
EOF

# Install dependencies
echo -e "${YELLOW}Installing backend dependencies (this may take a minute)...${NC}"
npm install --silent

echo -e "${GREEN}✅ Backend dependencies installed${NC}\n"

# Create .env.example
cat > .env.example << 'EOF'
# SSDF Backend Environment Variables
NODE_ENV=development
PORT=4242
FRONTEND_URL=http://localhost:3000

# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# PayPal (get from https://developer.paypal.com/developer/applications)
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=commercial@ssdf.work.gd

# Logging
LOG_LEVEL=info
EOF

cp .env.example .env

echo -e "${GREEN}✅ Created .env file (EDIT THIS with your API keys!)${NC}\n"

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
*.log
.DS_Store
EOF

cd ..

# Frontend setup
echo -e "${YELLOW}Setting up frontend...${NC}"
cd ssdf-frontend

cat > README.md << 'EOF'
# SSDF Frontend

Static HTML/CSS/JS frontend for SSDF.

## Usage

1. Open `index.html` in a browser
2. Or serve with: `python3 -m http.server 3000`
3. Or use Live Server in VS Code

## Configuration

Edit `index.html` and update:
- `CONFIG.stripePublishableKey` - Your Stripe publishable key
- `CONFIG.backendUrl` - Your backend URL
- PayPal client ID in script tag

## Deployment

Deploy to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting

No build step required!
EOF

echo -e "${GREEN}✅ Frontend structure created${NC}\n"
cd ..

# Documentation
echo -e "${YELLOW}Creating documentation...${NC}"

cat > docs/QUICK_REFERENCE.md << 'EOF'
# SSDF Quick Reference

## Essential Commands

### Development
```bash
# Backend
cd ssdf-backend
npm run dev

# Frontend (simple server)
cd ssdf-frontend
python3 -m http.server 3000
```

### Deployment
```bash
cd ssdf-backend
./deploy.sh staging    # Deploy to staging
./deploy.sh production # Deploy to production
```

### Testing
```bash
# Health check
curl http://localhost:4242/health

# Webhook testing
stripe listen --forward-to localhost:4242/webhook/stripe
```

## API Keys Required

1. **Stripe:** https://dashboard.stripe.com/apikeys
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)
   - Webhook secret (whsec_...)

2. **PayPal:** https://developer.paypal.com/developer/applications
   - Client ID
   - Client Secret

3. **Email:** Gmail App Password
   - Enable 2FA on Google account
   - Create app password: https://myaccount.google.com/apppasswords

## Environment Variables

Edit `ssdf-backend/.env`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

## Stripe Test Cards

Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184

Any future expiry, any CVC

## Common Issues

**"Webhook signature verification failed"**
→ Update STRIPE_WEBHOOK_SECRET in .env

**"Email delivery failed"**
→ Check EMAIL_USER and EMAIL_PASS are correct
→ Verify Gmail App Password (not regular password)

**"Health check failed"**
→ Check server is running: `npm run dev`
→ Check PORT in .env matches URL

## Next Steps

1. Edit `ssdf-backend/.env` with your API keys
2. Run backend: `cd ssdf-backend && npm run dev`
3. Edit frontend `index.html` with your keys
4. Open `ssdf-frontend/index.html` in browser
5. Test with Stripe test cards
6. Deploy when ready!
EOF

echo -e "${GREEN}✅ Documentation created${NC}\n"

# Create README
cat > README.md << 'EOF'
# SSDF - Secure Software Distribution Framework

Production-ready framework for open-source tools with commercial licensing.

## What You Have

```
ssdf/
├── ssdf-backend/        # Express server (payments, webhooks)
├── ssdf-frontend/       # Static HTML/JS (product catalog)
└── docs/                # Documentation
```

## Quick Start

1. **Get API Keys:**
   - Stripe: https://dashboard.stripe.com/apikeys
   - PayPal: https://developer.paypal.com/developer/applications
   - Gmail App Password: https://myaccount.google.com/apppasswords

2. **Configure Backend:**
   ```bash
   cd ssdf-backend
   nano .env  # Add your API keys
   npm run dev
   ```

3. **Configure Frontend:**
   - Edit `ssdf-frontend/index.html`
   - Update Stripe publishable key
   - Update PayPal client ID
   - Update backend URL

4. **Test:**
   - Open `ssdf-frontend/index.html` in browser
   - Add item to cart
   - Use test card: 4242 4242 4242 4242

## Documentation

- `docs/QUICK_REFERENCE.md` - Essential commands
- `docs/DEPLOYMENT_GUIDE.md` - Full deployment guide
- `docs/TESTING_GUIDE.md` - Complete testing strategy

## Next Steps

See `docs/QUICK_REFERENCE.md` for next steps!
EOF

# Final messages
echo -e "${GREEN}✅ Setup complete!${NC}\n"
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  SSDF is ready!                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Get your API keys:"
echo -e "   - Stripe: ${YELLOW}https://dashboard.stripe.com/apikeys${NC}"
echo -e "   - PayPal: ${YELLOW}https://developer.paypal.com/developer/applications${NC}"
echo -e "   - Gmail App Password: ${YELLOW}https://myaccount.google.com/apppasswords${NC}"
echo ""
echo -e "2. Configure backend:"
echo -e "   ${YELLOW}cd ssdf-backend${NC}"
echo -e "   ${YELLOW}nano .env${NC}  # Add your API keys"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo -e "3. Copy frontend files (from artifacts) to ${YELLOW}ssdf-frontend/${NC}"
echo ""
echo -e "4. Copy backend files (from artifacts) to ${YELLOW}ssdf-backend/${NC}"
echo ""
echo -e "5. Read the quick reference:"
echo -e "   ${YELLOW}cat docs/QUICK_REFERENCE.md${NC}"
echo ""
echo -e "${GREEN}Happy building! 🚀${NC}\n"
