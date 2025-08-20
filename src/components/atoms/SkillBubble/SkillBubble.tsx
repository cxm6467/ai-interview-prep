import React from 'react';

interface SkillBubbleProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning';
  className?: string;
}

export const SkillBubble: React.FC<SkillBubbleProps> = ({
  children,
  variant = 'success',
  className = ''
}) => {
  const baseStyles = {
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    display: 'inline-block'
  };

  const variantStyles = {
    success: { background: '#22c55e' },
    warning: { background: '#f97316' }
  };

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant]
  };

  return (
    <span className={className} style={combinedStyles}>
      {children}
    </span>
  );
};