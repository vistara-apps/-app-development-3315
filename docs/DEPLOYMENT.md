# Deployment Guide - Resilience Rituals

This guide covers the complete deployment process for the Resilience Rituals application, from development to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Third-party Services](#third-party-services)
5. [Frontend Deployment](#frontend-deployment)
6. [Backend Services](#backend-services)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts
- [Supabase](https://supabase.com) - Database and backend services
- [Stripe](https://stripe.com) - Payment processing
- [Neynar](https://neynar.com) - Farcaster API access
- [Privy](https://privy.io) - Wallet authentication
- [Vercel](https://vercel.com) or [Netlify](https://netlify.com) - Frontend hosting

### Development Tools
- Node.js 18+ and npm/yarn
- Git
- Code editor (VS Code recommended)

## Environment Setup

### 1. Clone and Install

```bash
git clone https://github.com/vistara-apps/-app-development-3315.git
cd -app-development-3315
npm install
```

### 2. Environment Variables

Create environment files for different stages:

#### Development (.env.development)
```env
# Supabase
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key

# Farcaster (Neynar)
VITE_NEYNAR_API_KEY=your-dev-neynar-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key

# Privy
VITE_PRIVY_APP_ID=your-dev-privy-app-id

# Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173
VITE_DEBUG_MODE=true
VITE_MOCK_PAYMENTS=true
```

#### Production (.env.production)
```env
# Supabase
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key

# Farcaster (Neynar)
VITE_NEYNAR_API_KEY=your-prod-neynar-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key

# Privy
VITE_PRIVY_APP_ID=your-prod-privy-app-id

# Configuration
VITE_API_BASE_URL=https://api.resilience-rituals.com
VITE_APP_URL=https://resilience-rituals.com
VITE_DEBUG_MODE=false
VITE_MOCK_PAYMENTS=false
```

## Database Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Wait for the project to be ready
4. Note down your project URL and anon key

### 2. Run Database Migrations

Execute the following SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  userId TEXT PRIMARY KEY,
  walletAddress TEXT UNIQUE NOT NULL,
  farcasterId TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  activeRituals TEXT[] DEFAULT '{}',
  streakCount INTEGER DEFAULT 0,
  longestStreak INTEGER DEFAULT 0,
  badgesEarned TEXT[] DEFAULT '{}',
  totalPoints INTEGER DEFAULT 0,
  socialShares INTEGER DEFAULT 0,
  premiumFeatures TEXT[] DEFAULT '{}',
  hasActiveSubscription BOOLEAN DEFAULT FALSE,
  lastActivity TIMESTAMP,
  totalRitualsCompleted INTEGER DEFAULT 0,
  customRitualsCreated INTEGER DEFAULT 0,
  moodLogsCount INTEGER DEFAULT 0,
  premiumPurchases INTEGER DEFAULT 0
);

-- Rituals table
CREATE TABLE rituals (
  ritualId TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId TEXT REFERENCES users(userId) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  frequency TEXT DEFAULT 'daily',
  startTime TIME,
  completedToday BOOLEAN DEFAULT FALSE,
  lastCompleted TIMESTAMP,
  icon TEXT,
  isCustom BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW(),
  isActive BOOLEAN DEFAULT TRUE
);

-- Sessions table
CREATE TABLE sessions (
  sessionId TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId TEXT REFERENCES users(userId) ON DELETE CASCADE,
  ritualId TEXT REFERENCES rituals(ritualId) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  moodBefore INTEGER CHECK (moodBefore >= 1 AND moodBefore <= 10),
  moodAfter INTEGER CHECK (moodAfter >= 1 AND moodAfter <= 10),
  notes TEXT,
  completionTime INTEGER,
  location TEXT,
  weather TEXT
);

-- Badges table
CREATE TABLE badges (
  badgeId TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  imageUrl TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  category TEXT,
  requirements JSONB
);

-- User badges table
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  userId TEXT REFERENCES users(userId) ON DELETE CASCADE,
  badgeId TEXT REFERENCES badges(badgeId) ON DELETE CASCADE,
  earnedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, badgeId)
);

-- Premium purchases table
CREATE TABLE premium_purchases (
  id SERIAL PRIMARY KEY,
  userId TEXT REFERENCES users(userId) ON DELETE CASCADE,
  featureType TEXT NOT NULL,
  purchaseDate TIMESTAMP DEFAULT NOW(),
  amount INTEGER,
  stripePaymentIntentId TEXT,
  status TEXT DEFAULT 'completed'
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  userId TEXT REFERENCES users(userId) ON DELETE CASCADE,
  stripeSubscriptionId TEXT UNIQUE,
  status TEXT,
  currentPeriodStart TIMESTAMP,
  currentPeriodEnd TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### 3. Set up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = userId);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = userId);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid()::text = userId);

-- Rituals are user-specific
CREATE POLICY "Users can manage own rituals" ON rituals FOR ALL USING (auth.uid()::text = userId);

-- Sessions are user-specific
CREATE POLICY "Users can manage own sessions" ON sessions FOR ALL USING (auth.uid()::text = userId);

-- User badges are user-specific
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid()::text = userId);

-- Premium purchases are user-specific
CREATE POLICY "Users can view own purchases" ON premium_purchases FOR SELECT USING (auth.uid()::text = userId);

-- Subscriptions are user-specific
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid()::text = userId);

-- Badges table is readable by all authenticated users
CREATE POLICY "Authenticated users can view badges" ON badges FOR SELECT TO authenticated USING (true);
```

### 4. Insert Initial Badge Data

```sql
-- Insert predefined badges
INSERT INTO badges (badgeId, name, description, icon, rarity, category, requirements) VALUES
('first-ritual', 'First Steps', 'Completed your first resilience ritual', '🌱', 'common', 'milestone', '{"type": "ritual_count", "value": 1}'),
('week-warrior', 'Week Warrior', 'Maintained a 7-day streak', '⚔️', 'common', 'streak', '{"type": "streak", "value": 7}'),
('consistency-champion', 'Consistency Champion', 'Completed rituals for 30 consecutive days', '🏆', 'rare', 'streak', '{"type": "streak", "value": 30}'),
('hundred-club', 'Hundred Club', 'Earned 100 resilience points', '💯', 'common', 'points', '{"type": "points", "value": 100}'),
('point-master', 'Point Master', 'Earned 1000 resilience points', '⭐', 'epic', 'points', '{"type": "points", "value": 1000}'),
('gratitude-guru', 'Gratitude Guru', 'Completed 50 gratitude rituals', '🙏', 'rare', 'ritual-specific', '{"type": "specific_ritual", "ritual_type": "gratitude", "value": 50}'),
('mindful-master', 'Mindful Master', 'Completed 50 mindfulness rituals', '🧘‍♀️', 'rare', 'ritual-specific', '{"type": "specific_ritual", "ritual_type": "mindfulness", "value": 50}'),
('social-sharer', 'Social Sharer', 'Shared 10 achievements on Farcaster', '📢', 'common', 'social', '{"type": "social_shares", "value": 10}'),
('inspiration-beacon', 'Inspiration Beacon', 'Shared 100 achievements on Farcaster', '🌟', 'epic', 'social', '{"type": "social_shares", "value": 100}'),
('premium-pioneer', 'Premium Pioneer', 'Unlocked your first premium feature', '💎', 'legendary', 'premium', '{"type": "premium_purchase", "value": 1}'),
('supporter', 'Supporter', 'Subscribed to unlimited access', '❤️', 'legendary', 'premium', '{"type": "subscription", "value": 1}');
```

## Third-party Services

### 1. Stripe Setup

#### Development Setup
1. Create a Stripe account
2. Get your test API keys from the dashboard
3. Create products and prices:

```bash
# Create products via Stripe CLI or dashboard
stripe products create --name="Advanced Gamification" --description="Unlock streak savers and challenge boosters"
stripe prices create --product=prod_xxx --unit-amount=50 --currency=usd

stripe products create --name="Unlimited Access" --description="All premium features included"
stripe prices create --product=prod_xxx --unit-amount=500 --currency=usd --recurring='{"interval":"month"}'
```

#### Production Setup
1. Activate your Stripe account
2. Get live API keys
3. Set up webhooks:
   - Endpoint: `https://api.resilience-rituals.com/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `invoice.payment_succeeded`, `customer.subscription.updated`

### 2. Neynar (Farcaster) Setup

1. Sign up at [Neynar](https://neynar.com)
2. Create an API key
3. Test the integration:

```bash
curl -X GET "https://api.neynar.com/v2/farcaster/user/bulk?fids=1" \
  -H "api_key: YOUR_API_KEY"
```

### 3. Privy Setup

1. Create account at [Privy](https://privy.io)
2. Create a new app
3. Configure settings:
   - Login methods: Wallet, Email, SMS
   - Supported wallets: MetaMask, WalletConnect, Coinbase Wallet
   - Embedded wallets: Enable for users without wallets

### 4. WalletConnect Setup

1. Create project at [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Get your project ID
3. Configure allowed domains

## Frontend Deployment

### 1. Vercel Deployment (Recommended)

#### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Manual Deployment
```bash
npm install -g vercel
npm run build
vercel --prod
```

#### Vercel Configuration (vercel.json)
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_NEYNAR_API_KEY": "@neynar-api-key",
    "VITE_STRIPE_PUBLISHABLE_KEY": "@stripe-publishable-key",
    "VITE_PRIVY_APP_ID": "@privy-app-id"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 2. Netlify Deployment

```bash
npm run build
# Upload dist/ folder to Netlify

# Or use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Netlify Configuration (netlify.toml)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 3. Custom Domain Setup

1. **DNS Configuration**
   ```
   Type: CNAME
   Name: www
   Value: your-app.vercel.app
   
   Type: A
   Name: @
   Value: 76.76.19.61 (Vercel's IP)
   ```

2. **SSL Certificate**
   - Automatic with Vercel/Netlify
   - Or use Let's Encrypt for custom setups

## Backend Services

### 1. API Server (Optional)

If you need custom backend logic, deploy a Node.js server:

```javascript
// server.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());

// Stripe webhook handler
app.post('/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle successful payment
      break;
    case 'customer.subscription.updated':
      // Handle subscription changes
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 2. Deploy to Railway/Render

```bash
# Railway
npm install -g @railway/cli
railway login
railway init
railway up

# Render
# Connect GitHub repo and deploy
```

## Monitoring & Analytics

### 1. Error Tracking

#### Sentry Setup
```bash
npm install @sentry/react @sentry/vite-plugin
```

```javascript
// main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});
```

### 2. Analytics

#### Vercel Analytics
```bash
npm install @vercel/analytics
```

```javascript
// main.jsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### 3. Performance Monitoring

#### Web Vitals
```javascript
// utils/analytics.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Security Considerations

### 1. Environment Variables
- Never commit API keys to version control
- Use different keys for development/production
- Rotate keys regularly

### 2. Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.supabase.co https://api.neynar.com https://api.stripe.com;
">
```

### 3. HTTPS Enforcement
```javascript
// Redirect HTTP to HTTPS in production
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Issues
```bash
# Check if Supabase URL and key are correct
curl -H "apikey: YOUR_ANON_KEY" "https://your-project.supabase.co/rest/v1/"
```

#### 2. Stripe Webhook Issues
```bash
# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:3000/webhooks/stripe
```

#### 3. Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### 4. Environment Variable Issues
```bash
# Verify environment variables are loaded
console.log(import.meta.env.VITE_SUPABASE_URL);
```

### Performance Issues

#### 1. Bundle Size Optimization
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

#### 2. Image Optimization
- Use WebP format for images
- Implement lazy loading
- Use appropriate image sizes

#### 3. Code Splitting
```javascript
// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const ProgressView = lazy(() => import('./components/ProgressView'));
```

## Maintenance

### 1. Regular Updates
- Update dependencies monthly
- Monitor security advisories
- Test updates in staging environment

### 2. Database Maintenance
- Monitor query performance
- Set up automated backups
- Review and optimize indexes

### 3. Monitoring Checklist
- [ ] Application uptime
- [ ] API response times
- [ ] Error rates
- [ ] Database performance
- [ ] Payment processing
- [ ] User engagement metrics

## Support

For deployment issues:
1. Check the [troubleshooting section](#troubleshooting)
2. Review service status pages (Vercel, Supabase, Stripe)
3. Check application logs
4. Contact support if needed

---

This deployment guide should help you successfully deploy Resilience Rituals to production. Remember to test thoroughly in a staging environment before deploying to production.
