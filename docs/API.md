# Resilience Rituals API Documentation

## Overview

This document outlines the complete API requirements and integrations for the Resilience Rituals application, including backend services, third-party integrations, and data models.

## Table of Contents

1. [Data Models](#data-models)
2. [Supabase Backend](#supabase-backend)
3. [Farcaster Integration](#farcaster-integration)
4. [Stripe Payments](#stripe-payments)
5. [Privy Authentication](#privy-authentication)
6. [API Endpoints](#api-endpoints)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

## Data Models

### User Entity

```sql
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
```

### Ritual Entity

```sql
CREATE TABLE rituals (
  ritualId TEXT PRIMARY KEY,
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
```

### Session Entity

```sql
CREATE TABLE sessions (
  sessionId TEXT PRIMARY KEY,
  userId TEXT REFERENCES users(userId) ON DELETE CASCADE,
  ritualId TEXT REFERENCES rituals(ritualId) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  moodBefore INTEGER CHECK (moodBefore >= 1 AND moodBefore <= 10),
  moodAfter INTEGER CHECK (moodAfter >= 1 AND moodAfter <= 10),
  notes TEXT,
  completionTime INTEGER, -- in seconds
  location TEXT,
  weather TEXT
);
```

### Badge Entity

```sql
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

CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  userId TEXT REFERENCES users(userId) ON DELETE CASCADE,
  badgeId TEXT REFERENCES badges(badgeId) ON DELETE CASCADE,
  earnedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, badgeId)
);
```

### Premium Features Entity

```sql
CREATE TABLE premium_purchases (
  id SERIAL PRIMARY KEY,
  userId TEXT REFERENCES users(userId) ON DELETE CASCADE,
  featureType TEXT NOT NULL,
  purchaseDate TIMESTAMP DEFAULT NOW(),
  amount INTEGER, -- in cents
  stripePaymentIntentId TEXT,
  status TEXT DEFAULT 'completed'
);

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

## Supabase Backend

### Configuration

```javascript
// supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Row Level Security (RLS) Policies

```sql
-- Users can only access their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = userId);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = userId);

-- Rituals are user-specific
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own rituals" ON rituals FOR ALL USING (auth.uid()::text = userId);

-- Sessions are user-specific
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sessions" ON sessions FOR ALL USING (auth.uid()::text = userId);

-- User badges are user-specific
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid()::text = userId);
```

### Database Functions

```sql
-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  last_session TIMESTAMP;
  current_streak INTEGER;
BEGIN
  -- Get the most recent session
  SELECT MAX(timestamp) INTO last_session
  FROM sessions
  WHERE userId = user_id;
  
  -- Calculate streak based on session history
  -- Implementation depends on business logic
  
  -- Update user record
  UPDATE users 
  SET streakCount = current_streak,
      longestStreak = GREATEST(longestStreak, current_streak)
  WHERE userId = user_id;
  
  RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to check badge eligibility
CREATE OR REPLACE FUNCTION check_badge_eligibility(user_id TEXT, badge_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  badge_requirements JSONB;
  user_stats RECORD;
BEGIN
  -- Get badge requirements
  SELECT requirements INTO badge_requirements
  FROM badges
  WHERE badgeId = badge_id;
  
  -- Get user statistics
  SELECT * INTO user_stats
  FROM users
  WHERE userId = user_id;
  
  -- Check requirements (implementation depends on badge type)
  -- Return TRUE if eligible, FALSE otherwise
  
  RETURN FALSE; -- Placeholder
END;
$$ LANGUAGE plpgsql;
```

## Farcaster Integration

### Neynar API Integration

```javascript
// farcaster.js
const NEYNAR_API_KEY = process.env.VITE_NEYNAR_API_KEY;
const NEYNAR_BASE_URL = 'https://api.neynar.com/v2';

// Cast a message
POST /farcaster/cast
{
  "signer_uuid": "user-signer-uuid",
  "text": "🌟 Just completed my morning gratitude ritual! 7 day streak going strong! 🔥",
  "embeds": [
    {
      "url": "https://resilience-rituals.com/share/ritual/123"
    }
  ]
}
```

### Required Endpoints

1. **POST /farcaster/cast** - Publish a cast
2. **GET /farcaster/user/bulk** - Get user profile information
3. **GET /farcaster/user/bulk-by-address** - Verify user by wallet address

### Cast Templates

```javascript
const castTemplates = {
  ritualCompletion: (ritual, streak) => 
    `🌟 Just completed my "${ritual.name}" ritual! ${streak > 1 ? `${streak} day streak going strong! 🔥` : ''} Building resilience one step at a time! 💪 #ResilienceRituals`,
  
  badgeEarned: (badge, totalBadges) =>
    `🏆 New badge unlocked: "${badge.name}"! ${badge.description} Now have ${totalBadges} badges in my resilience journey! 🌟 #ResilienceRituals`,
  
  weeklyProgress: (stats) =>
    `📊 Weekly resilience update: ${stats.ritualsCompleted} rituals completed, ${stats.streakDays} day streak, ${stats.pointsEarned} points earned! 💪 #ResilienceRituals #PersonalGrowth`
};
```

## Stripe Payments

### Payment Intents for Micro-transactions

```javascript
// Create payment intent
POST /api/payments/create-intent
{
  "amount": 50, // $0.50 in cents
  "currency": "usd",
  "metadata": {
    "userId": "user-123",
    "featureType": "advanced-gamification",
    "app": "resilience-rituals"
  }
}

// Response
{
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx"
}
```

### Subscription Management

```javascript
// Create subscription
POST /api/payments/create-subscription
{
  "userId": "user-123",
  "priceId": "price_monthly_unlimited",
  "metadata": {
    "app": "resilience-rituals",
    "plan": "unlimited-access"
  }
}
```

### Webhook Handling

```javascript
// Stripe webhook endpoint
POST /api/webhooks/stripe
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "metadata": {
        "userId": "user-123",
        "featureType": "advanced-gamification"
      }
    }
  }
}
```

### Premium Features Pricing

| Feature | Price | Description |
|---------|-------|-------------|
| Advanced Gamification | $0.50 | Streak savers, challenge boosters |
| Exclusive Rituals | $0.50 | Premium ritual library |
| Premium Badges | $0.50 | Rare badges and custom creation |
| Analytics Insights | $1.00 | Detailed progress analytics |
| Unlimited Subscription | $5.00/month | All features included |

## Privy Authentication

### Configuration

```javascript
// privy-config.js
import { PrivyProvider } from '@privy-io/react-auth';

const privyConfig = {
  appId: process.env.VITE_PRIVY_APP_ID,
  config: {
    loginMethods: ['wallet', 'email', 'sms'],
    appearance: {
      theme: 'dark',
      accentColor: '#6366F1',
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
    },
  },
};
```

### Authentication Flow

1. User connects wallet via Privy
2. Verify wallet ownership
3. Check for existing user account
4. Create new user if needed
5. Initialize user session

## API Endpoints

### User Management

```
GET    /api/users/:userId              - Get user profile
POST   /api/users                     - Create new user
PUT    /api/users/:userId             - Update user profile
DELETE /api/users/:userId             - Delete user account
GET    /api/users/:userId/stats       - Get user statistics
```

### Ritual Management

```
GET    /api/users/:userId/rituals     - Get user rituals
POST   /api/users/:userId/rituals     - Create new ritual
PUT    /api/rituals/:ritualId         - Update ritual
DELETE /api/rituals/:ritualId         - Delete ritual
POST   /api/rituals/:ritualId/complete - Complete ritual
```

### Session Tracking

```
GET    /api/users/:userId/sessions    - Get user sessions
POST   /api/sessions                  - Create session record
GET    /api/sessions/:sessionId       - Get session details
PUT    /api/sessions/:sessionId       - Update session
```

### Badge System

```
GET    /api/badges                    - Get all available badges
GET    /api/users/:userId/badges      - Get user badges
POST   /api/users/:userId/badges      - Award badge to user
GET    /api/badges/:badgeId           - Get badge details
```

### Payment Processing

```
POST   /api/payments/create-intent    - Create payment intent
POST   /api/payments/create-subscription - Create subscription
GET    /api/payments/verify/:intentId - Verify payment
GET    /api/users/:userId/purchases   - Get purchase history
GET    /api/users/:userId/access/:feature - Check feature access
```

### Social Integration

```
POST   /api/farcaster/cast           - Publish cast
GET    /api/farcaster/user/:fid      - Get Farcaster profile
POST   /api/farcaster/verify         - Verify Farcaster account
```

## Error Handling

### Standard Error Response

```javascript
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "userId",
      "issue": "User not found"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_REQUEST | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| PAYMENT_REQUIRED | 402 | Premium feature requires payment |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting

### Limits by Endpoint Type

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| Authentication | 10 requests | 1 minute |
| User Data | 100 requests | 1 minute |
| Ritual Completion | 50 requests | 1 minute |
| Social Sharing | 20 requests | 1 minute |
| Payment Processing | 10 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642262400
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access their own data
3. **Input Validation**: All inputs are validated and sanitized
4. **Rate Limiting**: Prevents abuse and ensures fair usage
5. **HTTPS Only**: All API communication over HTTPS
6. **Data Encryption**: Sensitive data encrypted at rest
7. **Audit Logging**: All actions logged for security monitoring

## Development Setup

1. Set up Supabase project and configure database
2. Configure Stripe account and webhook endpoints
3. Set up Neynar API account for Farcaster integration
4. Configure Privy for wallet authentication
5. Set environment variables as per `.env.example`
6. Run database migrations
7. Start development server

## Production Deployment

1. Configure production environment variables
2. Set up SSL certificates
3. Configure CDN for static assets
4. Set up monitoring and logging
5. Configure backup and disaster recovery
6. Implement CI/CD pipeline
7. Set up error tracking and performance monitoring
