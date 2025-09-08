import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Home, Plus, TrendingUp, Menu } from 'lucide-react';

const AppShell = ({ children, currentView, onViewChange }) => {
  const floatingShapes = Array.from({ length: 8 }, (_, i) => (
    <div
      key={i}
      className={`floating-shape animate-float`}
      style={{
        width: `${Math.random() * 100 + 50}px`,
        height: `${Math.random() * 100 + 50}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${4 + Math.random() * 4}s`
      }}
    />
  ));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating background shapes */}
      <div className="fixed inset-0 pointer-events-none">
        {floatingShapes}
      </div>

      {/* Header */}
      <header className="relative z-10 glass-card m-4 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"></div>
            <h1 className="text-xl font-bold text-white">Resilience Rituals</h1>
          </div>
          <div className="scale-75">
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-4">
        {children}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 z-20">
        <div className="glass-card rounded-xl p-2">
          <div className="flex justify-around items-center">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`p-3 rounded-lg transition-all duration-200 ${
                currentView === 'dashboard' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home size={24} />
            </button>
            <button
              onClick={() => onViewChange('create')}
              className={`p-3 rounded-lg transition-all duration-200 ${
                currentView === 'create' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Plus size={24} />
            </button>
            <button
              onClick={() => onViewChange('progress')}
              className={`p-3 rounded-lg transition-all duration-200 ${
                currentView === 'progress' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <TrendingUp size={24} />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AppShell;