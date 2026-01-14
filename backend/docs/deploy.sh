#!/bin/bash
#
# SSDF Production Deployment Script
# Usage: ./deploy.sh [environment]
# Environment: staging | production (default: staging)
#

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
APP_NAME="ssdf-backend-${ENVIRONMENT}"

echo -e "${GREEN}🚀 SSDF Deployment Script${NC}"
echo -e "Environment: ${YELLOW}${ENVIRONMENT}${NC}\n"

# Validation: Check required environment variables
echo -e "${YELLOW}🔍 Validating environment variables...${NC}"

required_vars=(
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "PAYPAL_CLIENT_ID"
    "PAYPAL_CLIENT_SECRET"
    "EMAIL_USER"
    "EMAIL_PASS"
    "EMAIL_FROM"
    "FRONTEND_URL"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ Error: Missing required environment variables:${NC}"
    printf '%s\n' "${missing_vars[@]}"
    echo -e "\nPlease set these variables before deploying:"
    echo "export STRIPE_SECRET_KEY=sk_..."
    echo "export PAYPAL_CLIENT_ID=..."
    exit 1
fi

echo -e "${GREEN}✅ All required variables are set${NC}\n"

# Check if we're in the right directory
if [ ! -f "server.js" ] && [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: server.js or package.json not found${NC}"
    echo "Please run this script from the backend directory"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

# Run tests if available
if grep -q "\"test\"" package.json; then
    echo -e "${YELLOW}✅ Running tests...${NC}"
    npm test || {
        echo -e "${RED}❌ Tests failed${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Tests passed${NC}\n"
else
    echo -e "${YELLOW}⚠️  No tests found, skipping...${NC}\n"
fi

# Git setup
echo -e "${YELLOW}🔧 Preparing Git repository...${NC}"

if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit: SSDF Backend ${ENVIRONMENT}"
else
    git add .
    git commit -m "Deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)" || echo "No changes to commit"
fi

# Heroku setup
echo -e "${YELLOW}🌐 Setting up Heroku...${NC}"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI not found${NC}"
    echo "Install from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Login check
heroku whoami &> /dev/null || {
    echo -e "${YELLOW}Please log in to Heroku:${NC}"
    heroku login
}

# Create or use existing app
if heroku apps:info --app "${APP_NAME}" &> /dev/null; then
    echo -e "${GREEN}✅ Using existing Heroku app: ${APP_NAME}${NC}"
else
    echo -e "${YELLOW}Creating new Heroku app: ${APP_NAME}${NC}"
    heroku create "${APP_NAME}"
fi

# Set Git remote
heroku git:remote -a "${APP_NAME}" 2>/dev/null || echo "Remote already exists"

# Set config vars
echo -e "${YELLOW}🔐 Setting environment variables on Heroku...${NC}"

heroku config:set \
    NODE_ENV="${ENVIRONMENT}" \
    STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}" \
    STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET}" \
    PAYPAL_CLIENT_ID="${PAYPAL_CLIENT_ID}" \
    PAYPAL_CLIENT_SECRET="${PAYPAL_CLIENT_SECRET}" \
    EMAIL_HOST="${EMAIL_HOST:-smtp.gmail.com}" \
    EMAIL_PORT="${EMAIL_PORT:-587}" \
    EMAIL_USER="${EMAIL_USER}" \
    EMAIL_PASS="${EMAIL_PASS}" \
    EMAIL_FROM="${EMAIL_FROM}" \
    FRONTEND_URL="${FRONTEND_URL}" \
    LOG_LEVEL="${LOG_LEVEL:-info}" \
    --app "${APP_NAME}"

# Deploy
echo -e "${YELLOW}🚀 Deploying to Heroku...${NC}"
git push heroku main || git push heroku master

# Scale dynos
echo -e "${YELLOW}📊 Scaling dynos...${NC}"
heroku ps:scale web=1 --app "${APP_NAME}"

# Wait for deployment
echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"
sleep 15

# Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
APP_URL=$(heroku apps:info --app "${APP_NAME}" | grep "Web URL" | awk '{print $3}')

if curl -f --max-time 10 "${APP_URL}health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Check logs: heroku logs --tail --app ${APP_NAME}"
    exit 1
fi

# Display logs
echo -e "\n${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "App URL:     ${YELLOW}${APP_URL}${NC}"
echo -e "Health:      ${YELLOW}${APP_URL}health${NC}"
echo -e "View logs:   ${YELLOW}heroku logs --tail --app ${APP_NAME}${NC}"
echo -e "Open app:    ${YELLOW}heroku open --app ${APP_NAME}${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Configure webhook URLs
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Configure Stripe webhook:"
echo "   URL: ${APP_URL}webhook/stripe"
echo "   Events: checkout.session.completed"
echo ""
echo "2. Configure PayPal webhook (optional):"
echo "   URL: ${APP_URL}webhook/paypal"
echo ""
echo "3. Update frontend CONFIG.backendUrl to:"
echo "   ${APP_URL}"
echo ""
echo "4. Test a purchase end-to-end"
echo ""

# Offer to tail logs
read -p "Tail logs now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    heroku logs --tail --app "${APP_NAME}"
fi
