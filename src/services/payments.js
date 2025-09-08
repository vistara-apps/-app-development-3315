import axios from 'axios';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.resilience-rituals.com';

// Payment service for handling Stripe transactions
export const paymentService = {
  /**
   * Create a payment intent for micro-transactions
   * @param {number} amount - Amount in cents (e.g., 50 for $0.50)
   * @param {string} currency - Currency code (default: 'usd')
   * @param {Object} metadata - Additional metadata for the payment
   */
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payments/create-intent`, {
        amount,
        currency,
        metadata: {
          ...metadata,
          app: 'resilience-rituals'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  },

  /**
   * Process a micro-transaction for premium features
   * @param {string} featureType - Type of feature being unlocked
   * @param {string} userId - User ID
   */
  async processMicroTransaction(featureType, userId) {
    const featurePricing = {
      'advanced-gamification': 50, // $0.50
      'exclusive-rituals': 50,     // $0.50
      'premium-badges': 50,        // $0.50
      'analytics-insights': 100,   // $1.00
      'custom-themes': 50,         // $0.50
    };

    const amount = featurePricing[featureType] || 50;

    return this.createPaymentIntent(amount, 'usd', {
      featureType,
      userId,
      transactionType: 'micro-transaction'
    });
  },

  /**
   * Create subscription for unlimited access
   * @param {string} userId - User ID
   * @param {string} priceId - Stripe price ID for the subscription
   */
  async createSubscription(userId, priceId = 'price_monthly_unlimited') {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payments/create-subscription`, {
        userId,
        priceId,
        metadata: {
          app: 'resilience-rituals',
          plan: 'unlimited-access'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  },

  /**
   * Verify payment completion
   * @param {string} paymentIntentId - Stripe payment intent ID
   */
  async verifyPayment(paymentIntentId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments/verify/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Failed to verify payment');
    }
  },

  /**
   * Get user's purchase history
   * @param {string} userId - User ID
   */
  async getPurchaseHistory(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      throw new Error('Failed to fetch purchase history');
    }
  },

  /**
   * Check if user has access to premium feature
   * @param {string} userId - User ID
   * @param {string} featureType - Type of feature to check
   */
  async checkFeatureAccess(userId, featureType) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments/access/${userId}/${featureType}`);
      return response.data.hasAccess;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }
};

// Premium features configuration
export const premiumFeatures = {
  'advanced-gamification': {
    name: 'Advanced Gamification',
    description: 'Unlock streak savers, challenge boosters, and exclusive achievements',
    price: 0.50,
    benefits: [
      'Streak Saver (protect your streak once per week)',
      'Challenge Boosters (2x points for daily challenges)',
      'Exclusive achievement badges',
      'Priority support'
    ]
  },
  'exclusive-rituals': {
    name: 'Exclusive Rituals',
    description: 'Access premium ritual templates and guided experiences',
    price: 0.50,
    benefits: [
      'Premium ritual library (50+ exclusive rituals)',
      'Guided meditation sessions',
      'Expert-crafted resilience exercises',
      'Seasonal ritual collections'
    ]
  },
  'premium-badges': {
    name: 'Premium Badges',
    description: 'Unlock rare badges and custom badge creation',
    price: 0.50,
    benefits: [
      'Rare and legendary badge collection',
      'Custom badge creation tools',
      'Badge showcase customization',
      'Special anniversary badges'
    ]
  },
  'analytics-insights': {
    name: 'Analytics & Insights',
    description: 'Deep insights into your resilience journey with advanced analytics',
    price: 1.00,
    benefits: [
      'Detailed progress analytics',
      'Mood tracking insights',
      'Personalized recommendations',
      'Export your data',
      'Trend analysis and predictions'
    ]
  },
  'unlimited-subscription': {
    name: 'Unlimited Access',
    description: 'All premium features included in one monthly subscription',
    price: 5.00,
    type: 'subscription',
    benefits: [
      'All premium features included',
      'Unlimited feature unlocks',
      'Priority customer support',
      'Early access to new features',
      'No additional micro-transaction fees'
    ]
  }
};

// Helper functions for payment UI
export const formatPrice = (cents) => {
  return `$${(cents / 100).toFixed(2)}`;
};

export const getPremiumFeatureInfo = (featureType) => {
  return premiumFeatures[featureType] || null;
};

export const calculateSavings = (individualFeatures, subscriptionPrice) => {
  const totalIndividual = individualFeatures.reduce((sum, feature) => {
    const featureInfo = premiumFeatures[feature];
    return sum + (featureInfo ? featureInfo.price * 100 : 0);
  }, 0);
  
  const savings = totalIndividual - (subscriptionPrice * 100);
  return Math.max(0, savings);
};
