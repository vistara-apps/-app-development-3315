# Resilience Rituals 🌟

**Build unbreakable emotional resilience, one ritual at a time.**

A Base mini app that helps users develop emotional resilience through daily habits, gamified engagement, and social accountability on Farcaster.

![Resilience Rituals Dashboard](https://via.placeholder.com/800x400/6366F1/FFFFFF?text=Resilience+Rituals+Dashboard)

## 🎯 Overview

Resilience Rituals is a comprehensive Base mini app designed to help users build emotional resilience through:

- **Daily Ritual Creation**: Curated library of impactful daily habits
- **Gamified Completion**: Points, badges, and streak tracking
- **Progress Visualization**: Personal dashboard with clear progress metrics
- **Farcaster Integration**: Social sharing and community accountability
- **Premium Features**: Advanced gamification and exclusive content

## ✨ Features

### Core Features

#### 🌱 Daily Ritual Creator
- Select from a curated library of resilience-building habits
- Set consistent times and formats for rituals
- Create custom rituals tailored to your needs
- Categories: Gratitude, Mindfulness, Affirmations, Breathing, Reflection

#### 🎮 Gamified Ritual Completion
- Earn points for completing daily rituals (10 points per ritual)
- Unlock badges for various achievements
- Maintain streaks with streak savers (premium feature)
- Challenge boosters for 2x points (premium feature)

#### 📊 Progress Visualization
- Personal dashboard with completion streaks
- Badge showcase with rarity indicators
- Mood tracking before and after rituals
- Weekly and monthly progress summaries

#### 🌐 Farcaster Social Integration
- Share ritual completions on Farcaster
- Celebrate badge achievements with the community
- Weekly progress updates
- Social accountability features

### Premium Features

#### 💎 Advanced Gamification ($0.50)
- Streak Saver: Protect your streak once per week
- Challenge Boosters: 2x points for daily challenges
- Exclusive achievement badges
- Priority support

#### 📚 Exclusive Rituals ($0.50)
- Premium ritual library (50+ exclusive rituals)
- Guided meditation sessions
- Expert-crafted resilience exercises
- Seasonal ritual collections

#### 🏆 Premium Badges ($0.50)
- Rare and legendary badge collection
- Custom badge creation tools
- Badge showcase customization
- Special anniversary badges

#### 📈 Analytics & Insights ($1.00)
- Detailed progress analytics
- Mood tracking insights
- Personalized recommendations
- Data export capabilities
- Trend analysis and predictions

#### 🎯 Unlimited Subscription ($5.00/month)
- All premium features included
- Unlimited feature unlocks
- Priority customer support
- Early access to new features

## 🛠 Technical Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Elegant notifications

### Blockchain & Web3
- **Wagmi** - React hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **Viem** - TypeScript interface for Ethereum
- **Privy** - Wallet authentication and management
- **Base Network** - L2 blockchain for transactions

### Backend Services
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication
- **Stripe** - Payment processing
- **Neynar API** - Farcaster integration

### Data Management
- **React Query** - Server state management
- **Custom Data Manager** - Centralized data coordination
- **Local Storage** - Client-side caching
- **Service Workers** - Background notifications

## 🏗 Architecture

### Data Models

```typescript
interface User {
  userId: string;
  walletAddress: string;
  farcasterId?: string;
  activeRituals: string[];
  streakCount: number;
  badgesEarned: string[];
  totalPoints: number;
  socialShares: number;
  premiumFeatures: string[];
  hasActiveSubscription: boolean;
}

interface Ritual {
  ritualId: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly';
  startTime: string;
  completedToday: boolean;
  icon: string;
}

interface Session {
  sessionId: string;
  userId: string;
  ritualId: string;
  timestamp: string;
  moodBefore?: number;
  moodAfter?: number;
  notes?: string;
}

interface Badge {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  requirements: BadgeRequirements;
}
```

### Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Data Manager   │    │   Supabase      │
│                 │◄──►│                 │◄──►│   Database      │
│ - Components    │    │ - Caching       │    │                 │
│ - Hooks         │    │ - Coordination  │    │ - Users         │
│ - State         │    │ - Business Logic│    │ - Rituals       │
└─────────────────┘    └─────────────────┘    │ - Sessions      │
                                              │ - Badges        │
┌─────────────────┐    ┌─────────────────┐    └─────────────────┘
│  Notifications  │    │   Farcaster     │
│                 │    │   (Neynar API)  │    ┌─────────────────┐
│ - Reminders     │    │                 │    │     Stripe      │
│ - Achievements  │    │ - Cast sharing  │    │                 │
│ - Motivational  │    │ - Profile data  │    │ - Payments      │
└─────────────────┘    └─────────────────┘    │ - Subscriptions │
                                              └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Stripe account (for payments)
- Neynar API key (for Farcaster)
- Privy account (for wallet auth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/-app-development-3315.git
   cd -app-development-3315
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys and configuration:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_NEYNAR_API_KEY=your-neynar-api-key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   VITE_PRIVY_APP_ID=your-privy-app-id
   ```

4. **Set up Supabase database**
   
   Run the SQL migrations in your Supabase project:
   ```sql
   -- See docs/API.md for complete database schema
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📱 User Flows

### Onboarding Flow
1. User connects wallet via Privy
2. Choose first resilience ritual from curated list
3. Set preferred time for ritual
4. Brief explanation of gamification system
5. First ritual added to dashboard

### Daily Ritual Completion Flow
1. User receives notification at chosen time
2. Opens mini app from notification
3. Performs ritual (journal entry, mindful button, etc.)
4. App confirms completion and awards points/badges
5. Optional: Cast completion to Farcaster
6. Return to Farcaster feed or app dashboard

### Progress Viewing Flow
1. Navigate to 'Progress' tab
2. View current streak, points, and badges
3. See history of completed rituals
4. Receive motivational messages based on progress

## 🎨 Design System

### Colors
- **Background**: `hsl(220, 10%, 95%)`
- **Primary**: `hsl(220, 80%, 50%)`
- **Accent**: `hsl(150, 70%, 45%)`
- **Surface**: `hsl(220, 10%, 100%)`
- **Text Primary**: `hsl(220, 15%, 15%)`
- **Text Secondary**: `hsl(220, 10%, 40%)`

### Typography
- **Display**: `text-4xl font-bold`
- **Heading**: `text-2xl font-semibold`
- **Body**: `text-base leading-7`
- **Caption**: `text-sm text-secondary`

### Components
- **AppShell**: Main layout with navigation
- **RitualCard**: Individual ritual display
- **ProgressTracker**: Streak and progress visualization
- **ActionLog**: Activity history
- **PrimaryButton** / **SecondaryButton**: Action buttons

## 🏆 Badge System

### Badge Categories

#### Milestone Badges
- **First Steps** 🌱 - Complete first ritual
- **Week Warrior** ⚔️ - 7-day streak
- **Consistency Champion** 🏆 - 30-day streak

#### Progress Badges
- **Hundred Club** 💯 - 100 points earned
- **Point Master** ⭐ - 1000 points earned

#### Ritual-Specific Badges
- **Gratitude Guru** 🙏 - 50 gratitude rituals
- **Mindful Master** 🧘‍♀️ - 50 mindfulness rituals

#### Social Badges
- **Social Sharer** 📢 - 10 Farcaster shares
- **Inspiration Beacon** 🌟 - 100 Farcaster shares

#### Premium Badges
- **Premium Pioneer** 💎 - First premium purchase
- **Supporter** ❤️ - Active subscription

### Badge Rarities
- **Common** (Gray) - Basic achievements
- **Rare** (Blue) - Moderate effort required
- **Epic** (Purple) - Significant commitment
- **Legendary** (Gold) - Exceptional achievements

## 💰 Business Model

### Micro-transactions
- **$0.50 per feature unlock**
- Low-friction engagement model
- Appeals to users seeking affordable improvements
- Incremental revenue growth

### Subscription Option
- **$5/month for unlimited access**
- Predictable revenue stream
- Better value for engaged users
- Includes all premium features

### Revenue Projections
- Target: 1000 active users
- 20% conversion to premium features
- Average revenue per user: $2-3/month
- Monthly recurring revenue: $2000-3000

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── AppShell.jsx    # Main layout
│   ├── Dashboard.jsx   # Main dashboard
│   ├── RitualCard.jsx  # Ritual display
│   └── ...
├── services/           # Business logic services
│   ├── supabase.js     # Database operations
│   ├── farcaster.js    # Social integration
│   ├── payments.js     # Stripe integration
│   ├── badges.js       # Badge system
│   ├── notifications.js # Push notifications
│   └── dataManager.js  # Central coordination
├── hooks/              # Custom React hooks
└── utils/              # Helper functions
```

### Key Services

#### DataManager
Central service that coordinates all app functionality:
- User initialization and management
- Ritual creation and completion
- Badge checking and awarding
- Social sharing integration
- Payment processing
- Statistics calculation

#### Badge System
Comprehensive achievement system:
- 15+ different badge types
- Automatic eligibility checking
- Progress tracking
- Rarity-based rewards

#### Notification System
Smart notification management:
- Ritual reminders
- Achievement notifications
- Streak warnings
- Weekly progress summaries

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**
   ```env
   VITE_SUPABASE_URL=https://prod-project.supabase.co
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   # ... other production keys
   ```

2. **Database Migration**
   - Run production database setup
   - Configure Row Level Security
   - Set up database functions

3. **Third-party Service Configuration**
   - Configure Stripe webhooks
   - Set up Neynar production API
   - Configure Privy for production

### Deployment Options

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

#### Docker
```bash
docker build -t resilience-rituals .
docker run -p 3000:3000 resilience-rituals
```

## 📊 Analytics & Monitoring

### Key Metrics
- **Daily Active Users (DAU)**
- **Ritual Completion Rate**
- **User Retention (7-day, 30-day)**
- **Premium Conversion Rate**
- **Average Revenue Per User (ARPU)**
- **Streak Length Distribution**
- **Badge Earning Rate**

### Monitoring Tools
- **Supabase Analytics** - Database metrics
- **Stripe Dashboard** - Payment analytics
- **Vercel Analytics** - Performance metrics
- **Custom Dashboard** - Business metrics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Write meaningful commit messages
- Add JSDoc comments for functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Base Network** - L2 blockchain infrastructure
- **Farcaster** - Decentralized social protocol
- **Supabase** - Backend-as-a-Service platform
- **Stripe** - Payment processing
- **Privy** - Wallet authentication

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/vistara-apps/-app-development-3315/issues)
- **Discord**: [Join our community](https://discord.gg/resilience-rituals)
- **Email**: support@resilience-rituals.com

---

**Built with ❤️ for the Base ecosystem and Farcaster community**

*Resilience Rituals - Building unbreakable emotional resilience, one ritual at a time.* 🌟
