// Badge system for Resilience Rituals
export const badgeDefinitions = {
  // Starter badges
  'first-ritual': {
    id: 'first-ritual',
    name: 'First Steps',
    description: 'Completed your first resilience ritual',
    icon: '🌱',
    rarity: 'common',
    category: 'milestone',
    requirements: {
      type: 'ritual_count',
      value: 1
    }
  },
  'week-warrior': {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    icon: '⚔️',
    rarity: 'common',
    category: 'streak',
    requirements: {
      type: 'streak',
      value: 7
    }
  },
  'consistency-champion': {
    id: 'consistency-champion',
    name: 'Consistency Champion',
    description: 'Completed rituals for 30 consecutive days',
    icon: '🏆',
    rarity: 'rare',
    category: 'streak',
    requirements: {
      type: 'streak',
      value: 30
    }
  },

  // Progress badges
  'hundred-club': {
    id: 'hundred-club',
    name: 'Hundred Club',
    description: 'Earned 100 resilience points',
    icon: '💯',
    rarity: 'common',
    category: 'points',
    requirements: {
      type: 'points',
      value: 100
    }
  },
  'point-master': {
    id: 'point-master',
    name: 'Point Master',
    description: 'Earned 1000 resilience points',
    icon: '⭐',
    rarity: 'epic',
    category: 'points',
    requirements: {
      type: 'points',
      value: 1000
    }
  },

  // Ritual-specific badges
  'gratitude-guru': {
    id: 'gratitude-guru',
    name: 'Gratitude Guru',
    description: 'Completed 50 gratitude rituals',
    icon: '🙏',
    rarity: 'rare',
    category: 'ritual-specific',
    requirements: {
      type: 'specific_ritual',
      ritual_type: 'gratitude',
      value: 50
    }
  },
  'mindful-master': {
    id: 'mindful-master',
    name: 'Mindful Master',
    description: 'Completed 50 mindfulness rituals',
    icon: '🧘‍♀️',
    rarity: 'rare',
    category: 'ritual-specific',
    requirements: {
      type: 'specific_ritual',
      ritual_type: 'mindfulness',
      value: 50
    }
  },

  // Social badges
  'social-sharer': {
    id: 'social-sharer',
    name: 'Social Sharer',
    description: 'Shared 10 achievements on Farcaster',
    icon: '📢',
    rarity: 'common',
    category: 'social',
    requirements: {
      type: 'social_shares',
      value: 10
    }
  },
  'inspiration-beacon': {
    id: 'inspiration-beacon',
    name: 'Inspiration Beacon',
    description: 'Shared 100 achievements on Farcaster',
    icon: '🌟',
    rarity: 'epic',
    category: 'social',
    requirements: {
      type: 'social_shares',
      value: 100
    }
  },

  // Time-based badges
  'early-bird': {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Completed 20 rituals before 8 AM',
    icon: '🌅',
    rarity: 'rare',
    category: 'time',
    requirements: {
      type: 'time_based',
      time_condition: 'before_8am',
      value: 20
    }
  },
  'night-owl': {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Completed 20 rituals after 10 PM',
    icon: '🦉',
    rarity: 'rare',
    category: 'time',
    requirements: {
      type: 'time_based',
      time_condition: 'after_10pm',
      value: 20
    }
  },

  // Special achievement badges
  'resilience-architect': {
    id: 'resilience-architect',
    name: 'Resilience Architect',
    description: 'Created 10 custom rituals',
    icon: '🏗️',
    rarity: 'epic',
    category: 'creation',
    requirements: {
      type: 'custom_rituals',
      value: 10
    }
  },
  'mood-tracker': {
    id: 'mood-tracker',
    name: 'Mood Tracker',
    description: 'Logged mood data for 30 sessions',
    icon: '📊',
    rarity: 'rare',
    category: 'tracking',
    requirements: {
      type: 'mood_logs',
      value: 30
    }
  },

  // Premium badges (require payment)
  'premium-pioneer': {
    id: 'premium-pioneer',
    name: 'Premium Pioneer',
    description: 'Unlocked your first premium feature',
    icon: '💎',
    rarity: 'legendary',
    category: 'premium',
    requirements: {
      type: 'premium_purchase',
      value: 1
    }
  },
  'supporter': {
    id: 'supporter',
    name: 'Supporter',
    description: 'Subscribed to unlimited access',
    icon: '❤️',
    rarity: 'legendary',
    category: 'premium',
    requirements: {
      type: 'subscription',
      value: 1
    }
  },

  // Seasonal badges
  'new-year-resolution': {
    id: 'new-year-resolution',
    name: 'New Year Resolution',
    description: 'Started your resilience journey in January',
    icon: '🎊',
    rarity: 'rare',
    category: 'seasonal',
    requirements: {
      type: 'seasonal',
      season: 'new_year',
      value: 1
    }
  }
};

// Badge checking service
export class BadgeService {
  constructor(userService, sessionService) {
    this.userService = userService;
    this.sessionService = sessionService;
  }

  /**
   * Check if user qualifies for any new badges
   * @param {string} userId - User ID
   * @param {Object} userStats - Current user statistics
   * @param {Array} currentBadges - User's current badges
   */
  async checkForNewBadges(userId, userStats, currentBadges = []) {
    const newBadges = [];
    const currentBadgeIds = currentBadges.map(b => b.badgeId || b.id);

    for (const [badgeId, badge] of Object.entries(badgeDefinitions)) {
      // Skip if user already has this badge
      if (currentBadgeIds.includes(badgeId)) continue;

      // Check if user meets requirements
      if (await this.checkBadgeRequirements(userId, badge, userStats)) {
        newBadges.push(badge);
      }
    }

    return newBadges;
  }

  /**
   * Check if user meets requirements for a specific badge
   * @param {string} userId - User ID
   * @param {Object} badge - Badge definition
   * @param {Object} userStats - User statistics
   */
  async checkBadgeRequirements(userId, badge, userStats) {
    const { requirements } = badge;

    switch (requirements.type) {
      case 'ritual_count':
        return userStats.totalRitualsCompleted >= requirements.value;

      case 'streak':
        return userStats.streakCount >= requirements.value;

      case 'points':
        return userStats.totalPoints >= requirements.value;

      case 'specific_ritual':
        const ritualCount = userStats.ritualTypeCounts?.[requirements.ritual_type] || 0;
        return ritualCount >= requirements.value;

      case 'social_shares':
        return userStats.socialShares >= requirements.value;

      case 'time_based':
        return await this.checkTimeBased(userId, requirements);

      case 'custom_rituals':
        return userStats.customRitualsCreated >= requirements.value;

      case 'mood_logs':
        return userStats.moodLogsCount >= requirements.value;

      case 'premium_purchase':
        return userStats.premiumPurchases >= requirements.value;

      case 'subscription':
        return userStats.hasActiveSubscription;

      case 'seasonal':
        return this.checkSeasonalRequirement(userStats.joinDate, requirements);

      default:
        return false;
    }
  }

  /**
   * Check time-based requirements
   * @param {string} userId - User ID
   * @param {Object} requirements - Badge requirements
   */
  async checkTimeBased(userId, requirements) {
    try {
      const sessions = await this.sessionService.getUserSessions(userId);
      let count = 0;

      sessions.forEach(session => {
        const sessionTime = new Date(session.timestamp);
        const hour = sessionTime.getHours();

        switch (requirements.time_condition) {
          case 'before_8am':
            if (hour < 8) count++;
            break;
          case 'after_10pm':
            if (hour >= 22) count++;
            break;
        }
      });

      return count >= requirements.value;
    } catch (error) {
      console.error('Error checking time-based requirements:', error);
      return false;
    }
  }

  /**
   * Check seasonal requirements
   * @param {string} joinDate - User's join date
   * @param {Object} requirements - Badge requirements
   */
  checkSeasonalRequirement(joinDate, requirements) {
    const date = new Date(joinDate);
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed

    switch (requirements.season) {
      case 'new_year':
        return month === 1; // January
      case 'spring':
        return month >= 3 && month <= 5; // March-May
      case 'summer':
        return month >= 6 && month <= 8; // June-August
      case 'fall':
        return month >= 9 && month <= 11; // September-November
      case 'winter':
        return month === 12 || month <= 2; // December-February
      default:
        return false;
    }
  }

  /**
   * Get badge by ID
   * @param {string} badgeId - Badge ID
   */
  getBadge(badgeId) {
    return badgeDefinitions[badgeId] || null;
  }

  /**
   * Get badges by category
   * @param {string} category - Badge category
   */
  getBadgesByCategory(category) {
    return Object.values(badgeDefinitions).filter(badge => badge.category === category);
  }

  /**
   * Get badges by rarity
   * @param {string} rarity - Badge rarity
   */
  getBadgesByRarity(rarity) {
    return Object.values(badgeDefinitions).filter(badge => badge.rarity === rarity);
  }

  /**
   * Calculate badge completion percentage
   * @param {Array} userBadges - User's current badges
   */
  calculateCompletionPercentage(userBadges) {
    const totalBadges = Object.keys(badgeDefinitions).length;
    const earnedBadges = userBadges.length;
    return Math.round((earnedBadges / totalBadges) * 100);
  }
}

// Badge rarity levels and their properties
export const badgeRarities = {
  common: {
    name: 'Common',
    color: '#9CA3AF',
    glow: false
  },
  rare: {
    name: 'Rare',
    color: '#3B82F6',
    glow: true
  },
  epic: {
    name: 'Epic',
    color: '#8B5CF6',
    glow: true
  },
  legendary: {
    name: 'Legendary',
    color: '#F59E0B',
    glow: true
  }
};

// Helper functions
export const getBadgeRarityStyle = (rarity) => {
  const rarityInfo = badgeRarities[rarity] || badgeRarities.common;
  return {
    color: rarityInfo.color,
    glow: rarityInfo.glow
  };
};

export const formatBadgeDescription = (badge, userStats) => {
  let description = badge.description;
  
  // Add progress information for badges user hasn't earned yet
  if (badge.requirements) {
    const { requirements } = badge;
    let progress = '';
    
    switch (requirements.type) {
      case 'ritual_count':
        const completed = userStats.totalRitualsCompleted || 0;
        progress = ` (${completed}/${requirements.value})`;
        break;
      case 'streak':
        const streak = userStats.streakCount || 0;
        progress = ` (${streak}/${requirements.value} days)`;
        break;
      case 'points':
        const points = userStats.totalPoints || 0;
        progress = ` (${points}/${requirements.value} points)`;
        break;
    }
    
    if (progress) {
      description += progress;
    }
  }
  
  return description;
};
