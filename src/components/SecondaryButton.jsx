import React from 'react';

const SecondaryButton = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  disabled = false,
  className = '' 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center';
  
  const variantClasses = {
    default: 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/30',
    ghost: 'text-white/80 hover:text-white hover:bg-white/10'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'hover:scale-105 active:scale-95';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;