import React from 'react';
import { TrendingUp, Target, Calendar } from 'lucide-react';

const ProgressTracker = ({ completedToday, totalRituals, completionRate, streakCount, variant = 'streak' }) => {
  if (variant === 'badges') {
    const badges = [
      { id: 'first-ritual', name: 'First Steps', icon: '🌱', description: 'Completed your first ritual' },
      { id: 'week-warrior', name: 'Week Warrior', icon: '⚡', description: '7-day streak achieved' },
      { id: 'mindful-master', name: 'Mindful Master', icon: '🧘‍♀️', description: '50 mindfulness sessions' },
      { id: 'gratitude-guru', name: 'Gratitude Guru', icon: '🙏', description: '30 gratitude entries' }
    ];

    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {badges.map(badge => (
            <div key={badge.id} className="glass rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">{badge.icon}</div>
              <div className="text-sm font-medium text-white">{badge.name}</div>
              <div className="text-xs text-white/60">{badge.description}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Today's Progress
        </h3>
        <div className="text-sm text-white/60">
          {completedToday}/{totalRituals} completed
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-white/10 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
        <div className="absolute -top-8 left-0 text-xs text-white/60">
          0%
        </div>
        <div className="absolute -top-8 right-0 text-xs text-white/60">
          100%
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{Math.round(completionRate)}%</div>
          <div className="text-sm text-white/60">Completion Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{streakCount}</div>
          <div className="text-sm text-white/60">Day Streak</div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 glass rounded-lg">
        <p className="text-sm text-white/80 text-center">
          {completionRate === 100 
            ? "🎉 Perfect day! You're building incredible resilience!"
            : completionRate >= 50
            ? "💪 Great progress! Keep the momentum going!"
            : "🌱 Every step counts. You've got this!"
          }
        </p>
      </div>
    </div>
  );
};

export default ProgressTracker;