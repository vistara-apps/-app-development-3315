import React, { useState, useEffect } from 'react';
import AppShell from './components/AppShell';
import Dashboard from './components/Dashboard';
import RitualCreator from './components/RitualCreator';
import ProgressView from './components/ProgressView';
import { usePaymentContext } from './hooks/usePaymentContext';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState({
    userId: 'user-1',
    farcasterId: 'resilient_user',
    activeRituals: [],
    streakCount: 7,
    badgesEarned: ['first-ritual', 'week-warrior'],
    totalPoints: 350,
    completedToday: false
  });

  const [rituals, setRituals] = useState([
    {
      ritualId: 'ritual-1',
      name: 'Morning Gratitude',
      description: 'Write down 3 things you\'re grateful for',
      frequency: 'daily',
      startTime: '08:00',
      completedToday: false,
      icon: '🙏'
    },
    {
      ritualId: 'ritual-2',
      name: 'Mindful Breathing',
      description: '5 minutes of focused breathing',
      frequency: 'daily',
      startTime: '12:00',
      completedToday: true,
      icon: '🧘‍♀️'
    }
  ]);

  const [sessions, setSessions] = useState([
    {
      sessionId: 'session-1',
      ritualId: 'ritual-2',
      timestamp: new Date().toISOString(),
      moodBefore: 6,
      moodAfter: 8,
      notes: 'Felt much calmer after breathing exercise'
    }
  ]);

  const addRitual = (ritual) => {
    const newRitual = {
      ...ritual,
      ritualId: `ritual-${Date.now()}`,
      completedToday: false
    };
    setRituals(prev => [...prev, newRitual]);
    setUser(prev => ({ ...prev, activeRituals: [...prev.activeRituals, newRitual.ritualId] }));
  };

  const completeRitual = (ritualId) => {
    setRituals(prev => 
      prev.map(ritual => 
        ritual.ritualId === ritualId 
          ? { ...ritual, completedToday: true }
          : ritual
      )
    );
    
    const newSession = {
      sessionId: `session-${Date.now()}`,
      ritualId,
      timestamp: new Date().toISOString(),
      moodBefore: Math.floor(Math.random() * 5) + 5,
      moodAfter: Math.floor(Math.random() * 3) + 8,
      notes: 'Completed ritual successfully'
    };
    
    setSessions(prev => [...prev, newSession]);
    setUser(prev => ({ 
      ...prev, 
      totalPoints: prev.totalPoints + 10,
      streakCount: prev.streakCount + 1
    }));
  };

  return (
    <AppShell currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'dashboard' && (
        <Dashboard 
          user={user}
          rituals={rituals}
          sessions={sessions}
          onCompleteRitual={completeRitual}
          onNavigate={setCurrentView}
        />
      )}
      {currentView === 'create' && (
        <RitualCreator 
          onAddRitual={addRitual}
          onBack={() => setCurrentView('dashboard')}
        />
      )}
      {currentView === 'progress' && (
        <ProgressView 
          user={user}
          rituals={rituals}
          sessions={sessions}
          onBack={() => setCurrentView('dashboard')}
        />
      )}
    </AppShell>
  );
}

export default App;