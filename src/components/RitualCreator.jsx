import React, { useState } from 'react';
import { ArrowLeft, Clock, Repeat, Sparkles } from 'lucide-react';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

const RitualCreator = ({ onAddRitual, onBack }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customRitual, setCustomRitual] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    startTime: '08:00',
    icon: '🌟'
  });

  const ritualTemplates = [
    {
      id: 'gratitude',
      name: 'Morning Gratitude',
      description: 'Write down 3 things you\'re grateful for',
      icon: '🙏',
      category: 'Mindfulness'
    },
    {
      id: 'breathing',
      name: 'Mindful Breathing',
      description: '5 minutes of focused breathing',
      icon: '🧘‍♀️',
      category: 'Meditation'
    },
    {
      id: 'affirmation',
      name: 'Positive Affirmation',
      description: 'Repeat empowering statements',
      icon: '💪',
      category: 'Self-Talk'
    },
    {
      id: 'reflection',
      name: 'Daily Reflection',
      description: 'Journal about your day and emotions',
      icon: '📝',
      category: 'Journaling'
    },
    {
      id: 'movement',
      name: 'Gentle Movement',
      description: '10 minutes of stretching or light exercise',
      icon: '🤸‍♀️',
      category: 'Physical'
    },
    {
      id: 'nature',
      name: 'Nature Connection',
      description: 'Spend time outdoors mindfully',
      icon: '🌳',
      category: 'Environment'
    }
  ];

  const icons = ['🌟', '🙏', '🧘‍♀️', '💪', '📝', '🤸‍♀️', '🌳', '🌸', '🔥', '⚡', '🌙', '☀️'];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomRitual({
      name: template.name,
      description: template.description,
      frequency: 'daily',
      startTime: '08:00',
      icon: template.icon
    });
  };

  const handleCustomChange = (field, value) => {
    setCustomRitual(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = () => {
    if (customRitual.name && customRitual.description) {
      onAddRitual(customRitual);
      onBack();
    }
  };

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
        <h2 className="text-xl font-bold text-white">Create New Ritual</h2>
      </div>

      {/* Template Selection */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Choose a Template</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ritualTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedTemplate?.id === template.id
                  ? 'border-purple-400 bg-purple-400/20'
                  : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{template.icon}</div>
                <div>
                  <h4 className="font-medium text-white">{template.name}</h4>
                  <p className="text-sm text-white/60 mt-1">{template.description}</p>
                  <span className="text-xs text-purple-300 mt-2 inline-block">
                    {template.category}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Configuration */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Customize Your Ritual</h3>
        
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Ritual Name</label>
            <input
              type="text"
              value={customRitual.name}
              onChange={(e) => handleCustomChange('name', e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
              placeholder="Give your ritual a name..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
            <textarea
              value={customRitual.description}
              onChange={(e) => handleCustomChange('description', e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none h-20 resize-none"
              placeholder="Describe what this ritual involves..."
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Choose an Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map(icon => (
                <button
                  key={icon}
                  onClick={() => handleCustomChange('icon', icon)}
                  className={`p-3 rounded-lg text-xl transition-all duration-200 ${
                    customRitual.icon === icon
                      ? 'bg-purple-400/30 border-2 border-purple-400'
                      : 'bg-white/10 border-2 border-white/20 hover:border-white/40'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Preferred Time
              </label>
              <input
                type="time"
                value={customRitual.startTime}
                onChange={(e) => handleCustomChange('startTime', e.target.value)}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Repeat className="w-4 h-4 inline mr-1" />
                Frequency
              </label>
              <select
                value={customRitual.frequency}
                onChange={(e) => handleCustomChange('frequency', e.target.value)}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-purple-400 focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="flex space-x-3">
        <SecondaryButton onClick={onBack} className="flex-1">
          Cancel
        </SecondaryButton>
        <PrimaryButton 
          onClick={handleCreate}
          disabled={!customRitual.name || !customRitual.description}
          className="flex-1"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Create Ritual
        </PrimaryButton>
      </div>
    </div>
  );
};

export default RitualCreator;