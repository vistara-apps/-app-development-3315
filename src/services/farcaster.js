import axios from 'axios';

const NEYNAR_API_KEY = import.meta.env.VITE_NEYNAR_API_KEY || 'your-neynar-api-key';
const NEYNAR_BASE_URL = 'https://api.neynar.com/v2';

const neynarClient = axios.create({
  baseURL: NEYNAR_BASE_URL,
  headers: {
    'api_key': NEYNAR_API_KEY,
    'Content-Type': 'application/json',
  },
});

export const farcasterService = {
  /**
   * Cast a message to Farcaster
   * @param {string} signerUuid - The signer UUID for the user
   * @param {string} text - The text content to cast
   * @param {Object} options - Additional options for the cast
   */
  async publishCast(signerUuid, text, options = {}) {
    try {
      const payload = {
        signer_uuid: signerUuid,
        text: text,
        ...options
      };

      const response = await neynarClient.post('/farcaster/cast', payload);
      return response.data;
    } catch (error) {
      console.error('Error publishing cast:', error);
      throw new Error('Failed to publish cast to Farcaster');
    }
  },

  /**
   * Share ritual completion on Farcaster
   * @param {string} signerUuid - The signer UUID for the user
   * @param {Object} ritualData - The ritual completion data
   */
  async shareRitualCompletion(signerUuid, ritualData) {
    const { ritualName, streakCount, badgeEarned } = ritualData;
    
    let text = `🌟 Just completed my "${ritualName}" ritual! `;
    
    if (streakCount > 1) {
      text += `${streakCount} day streak going strong! 🔥 `;
    }
    
    if (badgeEarned) {
      text += `Earned the "${badgeEarned}" badge! 🏆 `;
    }
    
    text += `Building resilience one ritual at a time with @resilience-rituals 💪 #ResilienceRituals #PersonalGrowth`;

    return this.publishCast(signerUuid, text);
  },

  /**
   * Share badge achievement on Farcaster
   * @param {string} signerUuid - The signer UUID for the user
   * @param {Object} badgeData - The badge achievement data
   */
  async shareBadgeAchievement(signerUuid, badgeData) {
    const { badgeName, description, totalBadges } = badgeData;
    
    const text = `🏆 Achievement unlocked: "${badgeName}"! ${description} 
    
Now have ${totalBadges} badges in my resilience journey! 🌟 
    
Building unbreakable emotional resilience with @resilience-rituals 💪 #ResilienceRituals #Achievement`;

    return this.publishCast(signerUuid, text);
  },

  /**
   * Share milestone achievement on Farcaster
   * @param {string} signerUuid - The signer UUID for the user
   * @param {Object} milestoneData - The milestone data
   */
  async shareMilestone(signerUuid, milestoneData) {
    const { type, value, message } = milestoneData;
    
    let text = '';
    
    switch (type) {
      case 'streak':
        text = `🔥 ${value} day streak achieved! ${message} Building resilience one day at a time with @resilience-rituals 💪`;
        break;
      case 'points':
        text = `⭐ Reached ${value} resilience points! ${message} Every small step counts! 🌟 #ResilienceRituals`;
        break;
      case 'rituals':
        text = `🎯 Completed ${value} rituals! ${message} Consistency is key to building resilience! 💪 #PersonalGrowth`;
        break;
      default:
        text = `🌟 New milestone: ${message} Building resilience with @resilience-rituals! 💪`;
    }

    return this.publishCast(signerUuid, text);
  },

  /**
   * Get user's Farcaster profile
   * @param {string} fid - The Farcaster ID
   */
  async getUserProfile(fid) {
    try {
      const response = await neynarClient.get(`/farcaster/user/bulk?fids=${fid}`);
      return response.data.users[0];
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch Farcaster profile');
    }
  },

  /**
   * Verify user's Farcaster account
   * @param {string} fid - The Farcaster ID
   * @param {string} address - The wallet address to verify
   */
  async verifyUser(fid, address) {
    try {
      const profile = await this.getUserProfile(fid);
      const verifiedAddresses = profile.verified_addresses?.eth_addresses || [];
      
      return verifiedAddresses.some(addr => 
        addr.toLowerCase() === address.toLowerCase()
      );
    } catch (error) {
      console.error('Error verifying user:', error);
      return false;
    }
  }
};

// Helper function to generate sharing templates
export const generateShareText = {
  ritualCompletion: (ritualName, streakCount) => {
    const streakText = streakCount > 1 ? ` (${streakCount} day streak!)` : '';
    return `🌟 Just completed my "${ritualName}" ritual${streakText} Building resilience one step at a time! 💪 #ResilienceRituals`;
  },

  badgeEarned: (badgeName, totalBadges) => {
    return `🏆 New badge unlocked: "${badgeName}"! Now have ${totalBadges} badges in my resilience journey. Every achievement counts! 🌟 #ResilienceRituals`;
  },

  weeklyProgress: (completedRituals, streakCount, totalPoints) => {
    return `📊 Weekly resilience update: ${completedRituals} rituals completed, ${streakCount} day streak, ${totalPoints} points earned! Consistency is building my emotional strength! 💪 #ResilienceRituals #PersonalGrowth`;
  }
};
