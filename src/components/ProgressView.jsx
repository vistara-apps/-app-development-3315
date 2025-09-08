import React, { useState } from 'react';
import { ArrowLeft, Calendar, Trophy, TrendingUp, Star } from 'lucide-react';
import ProgressTracker from './ProgressTracker';
import ActionLog from './ActionLog';

const ProgressView = ({ user, rituals, sessions, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const weeklyProgress = [
    { day: 'Mon', completed: 2, total: 3 },
    { day: 'Tue', completed: 3, total: 3 },
    { day: 'Wed', completed: 2, total: 3 },
    { day: 'Thu', completed: 3, total: 3 },
    { day: 'Fri', completed: 1, total: 3 },
    { day: 'Sat', completed: 3, total: 3 },
    { day: 'Sun', completed: 2, total: 3 }
  ];

  const completedToday = rituals.filter(r => r.completedToday).length;
  const totalRituals = rituals.length;
  const completionRate = totalRituals > 0 ? (completedToday / totalRituals) * 100 : 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Your Progress</h2>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card rounded-xl p-2">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'badges', label: 'Badges', icon: Trophy },
            { id: 'history', label: 'History', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Progress */}
          <ProgressTracker
            completedToday={completedToday}
            totalRituals={totalRituals}
            completionRate={completionRate}
            streakCount={user.streakCount}
          />

          {/* Weekly Overview */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              This Week
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {weeklyProgress.map((day, index) => {
                const completion = (day.completed / day.total) * 100;
                return (
                  <div key={index} className="text-center">
                    <div className="text-xs text-white/60 mb-2">{day.day}</div>
                    <div className="relative w-8 h-16 bg-white/10 rounded-full mx-auto">
                      <div
                        className="absolute bottom-0 bg-gradient-to-t from-green-400 to-blue-500 rounded-full transition-all duration-300"
                        style={{
                          height: `${completion}%`,
                          width: '100%'
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {day.completed}/{day.total}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-4">
              <div className="text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{user.totalPoints}</div>
                <div className="text-sm text-white/60">Total Points</div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-center">
                <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{user.badgesEarned.length}</div>
                <div className="text-sm text-white/60">Badges Earned</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <ProgressTracker variant="badges" />
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <ActionLog sessions={sessions} rituals={rituals} />
        </div>
      )}
    </div>
  );
};

export default ProgressView;