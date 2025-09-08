import React, { useState } from 'react';
import RitualCard from './RitualCard';
import ProgressTracker from './ProgressTracker';
import PrimaryButton from './PrimaryButton';
import { Flame, Star, Trophy } from 'lucide-react';

const Dashboard = ({ user, rituals, sessions, onCompleteRitual, onNavigate }) => {
  const completedToday = rituals.filter(r => r.completedToday).length;
  const totalRituals = rituals.length;
  const completionRate = totalRituals > 0 ? (completedToday / totalRituals) * 100 : 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome Section */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome back! 👋
        </h2>
        <p className="text-white/80">
          Ready to continue building your resilience?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-lg p-4 text-center">
          <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{user.streakCount}</div>
          <div className="text-xs text-white/60">Day Streak</div>
        </div>
        <div className="glass-card rounded-lg p-4 text-center">
          <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{user.totalPoints}</div>
          <div className="text-xs text-white/60">Points</div>
        </div>
        <div className="glass-card rounded-lg p-4 text-center">
          <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{user.badgesEarned.length}</div>
          <div className="text-xs text-white/60">Badges</div>
        </div>
      </div>

      {/* Progress Overview */}
      <ProgressTracker
        completedToday={completedToday}
        totalRituals={totalRituals}
        completionRate={completionRate}
        streakCount={user.streakCount}
      />

      {/* Today's Rituals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Today's Rituals</h3>
          <PrimaryButton
            onClick={() => onNavigate('create')}
            size="sm"
            variant="outline"
          >
            Add Ritual
          </PrimaryButton>
        </div>

        <div className="space-y-3">
          {rituals.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-white/60 mb-4">No rituals yet. Start building your resilience!</p>
              <PrimaryButton onClick={() => onNavigate('create')}>
                Create Your First Ritual
              </PrimaryButton>
            </div>
          ) : (
            rituals.map(ritual => (
              <RitualCard
                key={ritual.ritualId}
                ritual={ritual}
                onComplete={() => onCompleteRitual(ritual.ritualId)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;