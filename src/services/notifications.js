// Notification system for Resilience Rituals
export class NotificationService {
  constructor() {
    this.permission = null;
    this.init();
  }

  /**
   * Initialize notification service
   */
  async init() {
    if ('Notification' in window) {
      this.permission = await this.requestPermission();
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Show a notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   */
  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    const defaultOptions = {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'resilience-rituals',
      requireInteraction: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto-close after 5 seconds if not requiring interaction
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Schedule ritual reminder notifications
   * @param {Array} rituals - User's rituals with scheduled times
   */
  scheduleRitualReminders(rituals) {
    // Clear existing reminders
    this.clearScheduledReminders();

    rituals.forEach(ritual => {
      if (ritual.startTime && !ritual.completedToday) {
        this.scheduleRitualReminder(ritual);
      }
    });
  }

  /**
   * Schedule a single ritual reminder
   * @param {Object} ritual - Ritual object
   */
  scheduleRitualReminder(ritual) {
    const now = new Date();
    const [hours, minutes] = ritual.startTime.split(':').map(Number);
    
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      this.showRitualReminder(ritual);
    }, timeUntilReminder);

    // Store timeout ID for cleanup
    if (!this.scheduledReminders) {
      this.scheduledReminders = new Map();
    }
    this.scheduledReminders.set(ritual.ritualId, timeoutId);
  }

  /**
   * Show ritual reminder notification
   * @param {Object} ritual - Ritual object
   */
  showRitualReminder(ritual) {
    const title = `Time for ${ritual.name}! 🌟`;
    const body = `${ritual.description}\n\nTap to complete your ritual and maintain your streak!`;

    this.showNotification(title, {
      body,
      icon: '/ritual-reminder-icon.png',
      tag: `ritual-${ritual.ritualId}`,
      requireInteraction: true,
      actions: [
        {
          action: 'complete',
          title: 'Complete Now',
          icon: '/complete-icon.png'
        },
        {
          action: 'snooze',
          title: 'Remind in 15 min',
          icon: '/snooze-icon.png'
        }
      ],
      data: {
        ritualId: ritual.ritualId,
        type: 'ritual-reminder'
      }
    });
  }

  /**
   * Show achievement notification
   * @param {Object} achievement - Achievement data
   */
  showAchievementNotification(achievement) {
    const { type, title, description, icon } = achievement;

    let notificationTitle = '';
    let notificationBody = '';

    switch (type) {
      case 'badge':
        notificationTitle = `🏆 New Badge Earned!`;
        notificationBody = `${title}: ${description}`;
        break;
      case 'streak':
        notificationTitle = `🔥 Streak Milestone!`;
        notificationBody = `${title} - ${description}`;
        break;
      case 'points':
        notificationTitle = `⭐ Points Milestone!`;
        notificationBody = `${title} - ${description}`;
        break;
      default:
        notificationTitle = `🌟 Achievement Unlocked!`;
        notificationBody = `${title}: ${description}`;
    }

    this.showNotification(notificationTitle, {
      body: notificationBody,
      icon: '/achievement-icon.png',
      tag: `achievement-${type}`,
      requireInteraction: true,
      actions: [
        {
          action: 'share',
          title: 'Share on Farcaster',
          icon: '/share-icon.png'
        },
        {
          action: 'view',
          title: 'View Progress',
          icon: '/view-icon.png'
        }
      ],
      data: {
        type: 'achievement',
        achievement
      }
    });
  }

  /**
   * Show streak warning notification
   * @param {number} streakCount - Current streak count
   * @param {number} hoursRemaining - Hours remaining to maintain streak
   */
  showStreakWarning(streakCount, hoursRemaining) {
    const title = `⚠️ Streak at Risk!`;
    const body = `Your ${streakCount}-day streak expires in ${hoursRemaining} hours. Complete a ritual to keep it going!`;

    this.showNotification(title, {
      body,
      icon: '/streak-warning-icon.png',
      tag: 'streak-warning',
      requireInteraction: true,
      actions: [
        {
          action: 'complete-ritual',
          title: 'Complete Ritual',
          icon: '/complete-icon.png'
        }
      ],
      data: {
        type: 'streak-warning',
        streakCount,
        hoursRemaining
      }
    });
  }

  /**
   * Show weekly progress summary
   * @param {Object} weeklyStats - Weekly statistics
   */
  showWeeklyProgressSummary(weeklyStats) {
    const { ritualsCompleted, streakDays, pointsEarned, badgesEarned } = weeklyStats;

    const title = `📊 Weekly Progress Summary`;
    const body = `This week: ${ritualsCompleted} rituals, ${streakDays} streak days, ${pointsEarned} points, ${badgesEarned} new badges!`;

    this.showNotification(title, {
      body,
      icon: '/weekly-summary-icon.png',
      tag: 'weekly-summary',
      requireInteraction: false,
      actions: [
        {
          action: 'view-progress',
          title: 'View Details',
          icon: '/view-icon.png'
        },
        {
          action: 'share-progress',
          title: 'Share Progress',
          icon: '/share-icon.png'
        }
      ],
      data: {
        type: 'weekly-summary',
        stats: weeklyStats
      }
    });
  }

  /**
   * Show motivational notification
   * @param {string} message - Motivational message
   */
  showMotivationalNotification(message) {
    const motivationalMessages = [
      "Every small step builds unbreakable resilience! 💪",
      "Your consistency is inspiring! Keep going! 🌟",
      "Resilience is built one ritual at a time! 🏗️",
      "You're stronger than you think! 💎",
      "Progress, not perfection! 🎯"
    ];

    const randomMessage = message || motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    this.showNotification("🌟 Daily Motivation", {
      body: randomMessage,
      icon: '/motivation-icon.png',
      tag: 'daily-motivation',
      requireInteraction: false
    });
  }

  /**
   * Clear all scheduled reminders
   */
  clearScheduledReminders() {
    if (this.scheduledReminders) {
      this.scheduledReminders.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      this.scheduledReminders.clear();
    }
  }

  /**
   * Handle notification click events
   * @param {Event} event - Notification click event
   */
  handleNotificationClick(event) {
    const { action, notification } = event;
    const data = notification.data;

    switch (data.type) {
      case 'ritual-reminder':
        this.handleRitualReminderAction(action, data);
        break;
      case 'achievement':
        this.handleAchievementAction(action, data);
        break;
      case 'streak-warning':
        this.handleStreakWarningAction(action, data);
        break;
      case 'weekly-summary':
        this.handleWeeklySummaryAction(action, data);
        break;
    }

    notification.close();
  }

  /**
   * Handle ritual reminder actions
   * @param {string} action - Action type
   * @param {Object} data - Notification data
   */
  handleRitualReminderAction(action, data) {
    switch (action) {
      case 'complete':
        // Navigate to ritual completion
        window.location.hash = `#/ritual/${data.ritualId}`;
        break;
      case 'snooze':
        // Schedule another reminder in 15 minutes
        setTimeout(() => {
          this.showRitualReminder({ ritualId: data.ritualId });
        }, 15 * 60 * 1000);
        break;
    }
  }

  /**
   * Handle achievement actions
   * @param {string} action - Action type
   * @param {Object} data - Notification data
   */
  handleAchievementAction(action, data) {
    switch (action) {
      case 'share':
        // Trigger Farcaster share
        window.dispatchEvent(new CustomEvent('share-achievement', {
          detail: data.achievement
        }));
        break;
      case 'view':
        // Navigate to progress view
        window.location.hash = '#/progress';
        break;
    }
  }

  /**
   * Handle streak warning actions
   * @param {string} action - Action type
   * @param {Object} data - Notification data
   */
  handleStreakWarningAction(action, data) {
    switch (action) {
      case 'complete-ritual':
        // Navigate to dashboard
        window.location.hash = '#/dashboard';
        break;
    }
  }

  /**
   * Handle weekly summary actions
   * @param {string} action - Action type
   * @param {Object} data - Notification data
   */
  handleWeeklySummaryAction(action, data) {
    switch (action) {
      case 'view-progress':
        window.location.hash = '#/progress';
        break;
      case 'share-progress':
        window.dispatchEvent(new CustomEvent('share-weekly-progress', {
          detail: data.stats
        }));
        break;
    }
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus() {
    return this.permission;
  }

  /**
   * Check if notifications are supported
   */
  isSupported() {
    return 'Notification' in window;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Helper function to register service worker for notifications
export const registerNotificationServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Handle notification clicks in service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'notification-click') {
          notificationService.handleNotificationClick(event.data);
        }
      });

      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }
  return null;
};
