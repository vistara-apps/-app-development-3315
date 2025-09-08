import React from 'react';
import { CheckCircle, Star, Clock } from 'lucide-react';

const ActionLog = ({ sessions, rituals, variant = 'ritualEntry' }) => {
  const getRitualName = (ritualId) => {
    const ritual = rituals.find(r => r.ritualId === ritualId);
    return ritual ? ritual.name : 'Unknown Ritual';
  };

  const getRitualIcon = (ritualId) => {
    const ritual = rituals.find(r => r.ritualId === ritualId);
    return ritual ? ritual.icon : '⭐';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const mockBadgeEvents = [
    {
      id: 'badge-1',
      type: 'badge',
      badgeName: 'Week Warrior',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      icon: '⚡'
    },
    {
      id: 'badge-2',
      type: 'badge',
      badgeName: 'First Steps',
      timestamp: new Date(Date.now() - 604800000).toISOString(),
      icon: '🌱'
    }
  ];

  const allEvents = [
    ...sessions.map(session => ({ ...session, type: 'ritual' })),
    ...mockBadgeEvents
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (variant === 'badgeEarned') {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Recent Achievements
        </h3>
        <div className="space-y-3">
          {mockBadgeEvents.map(event => (
            <div key={event.id} className="flex items-center space-x-3 p-3 glass rounded-lg">
              <div className="text-2xl">{event.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium text-white">Badge Earned: {event.badgeName}</h4>
                <p className="text-sm text-white/60">
                  {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                </p>
              </div>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Activity History
      </h3>
      
      {allEvents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60">No activity yet. Complete your first ritual to see your history!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allEvents.map((event, index) => (
            <div key={event.sessionId || event.id} className="flex items-center space-x-3 p-3 glass rounded-lg">
              {event.type === 'ritual' ? (
                <>
                  <div className="text-2xl">{getRitualIcon(event.ritualId)}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Completed: {getRitualName(event.ritualId)}</h4>
                    <p className="text-sm text-white/60">
                      {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                    </p>
                    {event.notes && (
                      <p className="text-xs text-white/50 mt-1">"{event.notes}"</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-400 font-medium">+10 pts</div>
                    <CheckCircle className="w-4 h-4 text-green-400 mx-auto mt-1" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl">{event.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Badge Earned: {event.badgeName}</h4>
                    <p className="text-sm text-white/60">
                      {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                    </p>
                  </div>
                  <Star className="w-5 h-5 text-yellow-400" />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionLog;