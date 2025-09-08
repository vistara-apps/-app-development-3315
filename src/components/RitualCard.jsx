import React, { useState } from 'react';
import { Clock, CheckCircle, Circle, Share2, Sparkles } from 'lucide-react';
import PrimaryButton from './PrimaryButton';
import { usePaymentContext } from '../hooks/usePaymentContext';

const RitualCard = ({ ritual, onComplete, variant = 'active' }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const { createSession } = usePaymentContext();

  const handleComplete = async () => {
    setIsCompleting(true);
    // Simulate ritual completion
    setTimeout(() => {
      onComplete();
      setIsCompleting(false);
    }, 1000);
  };

  const handleShare = async () => {
    // For premium sharing features
    if (!isPaid) {
      setShowPremium(true);
      return;
    }
    
    // Mock Farcaster share
    console.log(`Sharing ritual completion: ${ritual.name}`);
  };

  const handlePremiumUnlock = async () => {
    try {
      await createSession();
      setIsPaid(true);
      setShowPremium(false);
      // Unlock premium features
      handleShare();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  if (variant === 'completed') {
    return (
      <div className="glass-card rounded-xl p-4 border-l-4 border-green-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <h4 className="font-medium text-white">{ritual.name}</h4>
              <p className="text-sm text-white/60">Completed today!</p>
            </div>
          </div>
          <div className="text-2xl">{ritual.icon}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`glass-card rounded-xl p-4 transition-all duration-200 ${
        ritual.completedToday ? 'border-l-4 border-green-400' : ''
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{ritual.icon}</div>
            <div>
              <h4 className="font-medium text-white">{ritual.name}</h4>
              <p className="text-sm text-white/60">{ritual.description}</p>
            </div>
          </div>
          {ritual.completedToday ? (
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
          ) : (
            <Circle className="w-6 h-6 text-white/40 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-white/60">
            <Clock className="w-4 h-4" />
            <span>{ritual.startTime}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              disabled={!ritual.completedToday}
            >
              <Share2 className={`w-4 h-4 ${ritual.completedToday ? 'text-white' : 'text-white/40'}`} />
            </button>
            
            {!ritual.completedToday && (
              <PrimaryButton
                onClick={handleComplete}
                disabled={isCompleting}
                size="sm"
              >
                {isCompleting ? 'Completing...' : 'Complete'}
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>

      {/* Premium Feature Modal */}
      {showPremium && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-xl p-6 max-w-sm w-full">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Unlock Premium Sharing</h3>
              <p className="text-white/80 mb-6">
                Share your achievements on Farcaster and inspire others in your resilience journey!
              </p>
              <div className="space-y-3">
                <PrimaryButton onClick={handlePremiumUnlock} className="w-full">
                  Unlock for $0.50
                </PrimaryButton>
                <button
                  onClick={() => setShowPremium(false)}
                  className="w-full text-white/60 hover:text-white transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RitualCard;