import { userService, ritualService, sessionService, badgeService } from './supabase.js';
import { farcasterService } from './farcaster.js';
import { paymentService } from './payments.js';
import { BadgeService, badgeDefinitions } from './badges.js';
import { notificationService } from './notifications.js';

/**
 * Central data management service that coordinates all app services
 */
export class DataManager {
  constructor() {
    this.badgeChecker = new BadgeService(userService, sessionService);
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Initialize user data and services
   * @param {string} userId - User ID
   * @param {string} walletAddress - User's wallet address
   * @param {string} farcasterId - User's Farcaster ID (optional)
   */
  async initializeUser(userId, walletAddress, farcasterId = null) {
    try {
      // Try to get existing user
      let user = await this.getUser(userId);
      
      if (!user) {
        // Create new user
        user = await userService.createUser({
          userId,
          walletAddress,
          farcasterId,
          createdAt: new Date().toISOString(),
          activeRituals: [],
          streakCount: 0,
          badgesEarned: [],
          totalPoints: 0,
          socialShares: 0,
          premiumFeatures: [],
          hasActiveSubscription: false
        });
      }

      // Initialize notifications
      await notificationService.init();
      
      // Schedule ritual reminders
      const rituals = await this.getUserRituals(userId);
      notificationService.scheduleRitualReminders(rituals);

      return user;
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  }

  /**
   * Get user data with caching
   * @param {string} userId - User ID
   */
  async getUser(userId) {
    const cacheKey = `user_${userId}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const user = await userService.getUser(userId);
      this.cache.set(cacheKey, {
        data: user,
        timestamp: Date.now()
      });
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Get user rituals
   * @param {string} userId - User ID
   */
  async getUserRituals(userId) {
    const cacheKey = `rituals_${userId}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const rituals = await ritualService.getUserRituals(userId);
      this.cache.set(cacheKey, {
        data: rituals,
        timestamp: Date.now()
      });
      return rituals;
    } catch (error) {
      console.error('Error getting user rituals:', error);
      return [];
    }
  }

  /**
   * Create a new ritual
   * @param {string} userId - User ID
   * @param {Object} ritualData - Ritual data
   */
  async createRitual(userId, ritualData) {
    try {
      const ritual = await ritualService.createRitual({
        ...ritualData,
        userId,
        createdAt: new Date().toISOString(),
        completedToday: false
      });

      // Clear cache
      this.cache.delete(`rituals_${userId}`);
      
      // Update user's active rituals
      const user = await this.getUser(userId);
      await userService.updateUser(userId, {
        activeRituals: [...user.activeRituals, ritual.ritualId]
      });

      // Reschedule notifications
      const allRituals = await this.getUserRituals(userId);
      notificationService.scheduleRitualReminders(allRituals);

      return ritual;
    } catch (error) {
      console.error('Error creating ritual:', error);
      throw error;
    }
  }

  /**
   * Complete a ritual and handle all side effects
   * @param {string} userId - User ID
   * @param {string} ritualId - Ritual ID
   * @param {Object} sessionData - Session completion data
   */
  async completeRitual(userId, ritualId, sessionData = {}) {
    try {
      // Mark ritual as completed
      await ritualService.updateRitual(ritualId, {
        completedToday: true,
        lastCompleted: new Date().toISOString()
      });

      // Create session record
      const session = await sessionService.createSession({
        userId,
        ritualId,
        timestamp: new Date().toISOString(),
        moodBefore: sessionData.moodBefore || null,
        moodAfter: sessionData.moodAfter || null,
        notes: sessionData.notes || '',
        completionTime: sessionData.completionTime || null
      });

      // Update user stats
      const user = await this.getUser(userId);
      const updatedUser = await this.updateUserStats(userId, {
        totalPoints: user.totalPoints + 10,
        streakCount: user.streakCount + 1,
        totalRitualsCompleted: (user.totalRitualsCompleted || 0) + 1,
        lastActivity: new Date().toISOString()
      });

      // Check for new badges
      const userStats = await this.getUserStats(userId);
      const currentBadges = await badgeService.getUserBadges(userId);
      const newBadges = await this.badgeChecker.checkForNewBadges(userId, userStats, currentBadges);

      // Award new badges
      for (const badge of newBadges) {
        await this.awardBadge(userId, badge.id);
      }

      // Clear relevant caches
      this.cache.delete(`user_${userId}`);
      this.cache.delete(`rituals_${userId}`);
      this.cache.delete(`sessions_${userId}`);

      return {
        session,
        user: updatedUser,
        newBadges,
        pointsEarned: 10
      };
    } catch (error) {
      console.error('Error completing ritual:', error);
      throw error;
    }
  }

  /**
   * Award a badge to user
   * @param {string} userId - User ID
   * @param {string} badgeId - Badge ID
   */
  async awardBadge(userId, badgeId) {
    try {
      await badgeService.awardBadge(userId, badgeId);
      
      const badge = badgeDefinitions[badgeId];
      if (badge) {
        // Show achievement notification
        notificationService.showAchievementNotification({
          type: 'badge',
          title: badge.name,
          description: badge.description,
          icon: badge.icon
        });

        // Update user's badge count
        const user = await this.getUser(userId);
        await userService.updateUser(userId, {
          badgesEarned: [...user.badgesEarned, badgeId]
        });
      }

      return badge;
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  }

  /**
   * Share achievement on Farcaster
   * @param {string} userId - User ID
   * @param {string} signerUuid - Farcaster signer UUID
   * @param {Object} achievementData - Achievement data to share
   */
  async shareAchievement(userId, signerUuid, achievementData) {
    try {
      let result;
      
      switch (achievementData.type) {
        case 'ritual':
          result = await farcasterService.shareRitualCompletion(signerUuid, achievementData);
          break;
        case 'badge':
          result = await farcasterService.shareBadgeAchievement(signerUuid, achievementData);
          break;
        case 'milestone':
          result = await farcasterService.shareMilestone(signerUuid, achievementData);
          break;
        default:
          throw new Error('Unknown achievement type');
      }

      // Update user's social share count
      const user = await this.getUser(userId);
      await userService.updateUser(userId, {
        socialShares: (user.socialShares || 0) + 1
      });

      // Clear cache
      this.cache.delete(`user_${userId}`);

      return result;
    } catch (error) {
      console.error('Error sharing achievement:', error);
      throw error;
    }
  }

  /**
   * Process premium feature purchase
   * @param {string} userId - User ID
   * @param {string} featureType - Feature type
   */
  async purchasePremiumFeature(userId, featureType) {
    try {
      // Create payment intent
      const paymentIntent = await paymentService.processMicroTransaction(featureType, userId);
      
      // Note: In a real implementation, you would wait for payment confirmation
      // For now, we'll simulate successful payment
      
      // Update user's premium features
      const user = await this.getUser(userId);
      const updatedFeatures = [...(user.premiumFeatures || []), featureType];
      
      await userService.updateUser(userId, {
        premiumFeatures: updatedFeatures,
        premiumPurchases: (user.premiumPurchases || 0) + 1
      });

      // Check for premium badges
      const userStats = await this.getUserStats(userId);
      const currentBadges = await badgeService.getUserBadges(userId);
      const newBadges = await this.badgeChecker.checkForNewBadges(userId, userStats, currentBadges);

      for (const badge of newBadges) {
        if (badge.category === 'premium') {
          await this.awardBadge(userId, badge.id);
        }
      }

      // Clear cache
      this.cache.delete(`user_${userId}`);

      return {
        paymentIntent,
        featureUnlocked: featureType,
        newBadges: newBadges.filter(b => b.category === 'premium')
      };
    } catch (error) {
      console.error('Error purchasing premium feature:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive user statistics
   * @param {string} userId - User ID
   */
  async getUserStats(userId) {
    try {
      const user = await this.getUser(userId);
      const rituals = await this.getUserRituals(userId);
      const sessions = await sessionService.getUserSessions(userId);
      const badges = await badgeService.getUserBadges(userId);

      // Calculate ritual type counts
      const ritualTypeCounts = {};
      sessions.forEach(session => {
        const ritual = rituals.find(r => r.ritualId === session.ritualId);
        if (ritual && ritual.category) {
          ritualTypeCounts[ritual.category] = (ritualTypeCounts[ritual.category] || 0) + 1;
        }
      });

      // Calculate mood improvement
      const moodSessions = sessions.filter(s => s.moodBefore && s.moodAfter);
      const avgMoodImprovement = moodSessions.length > 0 
        ? moodSessions.reduce((sum, s) => sum + (s.moodAfter - s.moodBefore), 0) / moodSessions.length
        : 0;

      return {
        userId: user.userId,
        totalPoints: user.totalPoints || 0,
        streakCount: user.streakCount || 0,
        totalRitualsCompleted: sessions.length,
        totalBadges: badges.length,
        socialShares: user.socialShares || 0,
        customRitualsCreated: rituals.filter(r => r.isCustom).length,
        moodLogsCount: moodSessions.length,
        premiumPurchases: user.premiumPurchases || 0,
        hasActiveSubscription: user.hasActiveSubscription || false,
        joinDate: user.createdAt,
        ritualTypeCounts,
        avgMoodImprovement,
        completionRate: rituals.length > 0 ? (rituals.filter(r => r.completedToday).length / rituals.length) * 100 : 0,
        longestStreak: user.longestStreak || user.streakCount || 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {};
    }
  }

  /**
   * Update user statistics
   * @param {string} userId - User ID
   * @param {Object} updates - Statistics updates
   */
  async updateUserStats(userId, updates) {
    try {
      const updatedUser = await userService.updateUser(userId, updates);
      
      // Clear cache
      this.cache.delete(`user_${userId}`);
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  /**
   * Get weekly progress summary
   * @param {string} userId - User ID
   */
  async getWeeklyProgress(userId) {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const sessions = await sessionService.getUserSessions(userId);
      const weeklySessions = sessions.filter(s => new Date(s.timestamp) >= oneWeekAgo);

      const badges = await badgeService.getUserBadges(userId);
      const weeklyBadges = badges.filter(b => new Date(b.earnedAt) >= oneWeekAgo);

      return {
        ritualsCompleted: weeklySessions.length,
        streakDays: Math.min(7, weeklySessions.length), // Simplified calculation
        pointsEarned: weeklySessions.length * 10, // Assuming 10 points per ritual
        badgesEarned: weeklyBadges.length,
        moodImprovement: weeklySessions
          .filter(s => s.moodBefore && s.moodAfter)
          .reduce((sum, s) => sum + (s.moodAfter - s.moodBefore), 0) / weeklySessions.length || 0
      };
    } catch (error) {
      console.error('Error getting weekly progress:', error);
      return {
        ritualsCompleted: 0,
        streakDays: 0,
        pointsEarned: 0,
        badgesEarned: 0,
        moodImprovement: 0
      };
    }
  }

  /**
   * Check if user has access to premium feature
   * @param {string} userId - User ID
   * @param {string} featureType - Feature type
   */
  async hasFeatureAccess(userId, featureType) {
    try {
      const user = await this.getUser(userId);
      
      // Check subscription first
      if (user.hasActiveSubscription) {
        return true;
      }

      // Check individual feature purchases
      return user.premiumFeatures?.includes(featureType) || false;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const dataManager = new DataManager();
