import React from 'react';

/**
 * Props for the SkillBubble component
 */
interface SkillBubbleProps {
  /** Content to display inside the bubble */
  children: React.ReactNode;
  /** Visual variant determining the bubble's color scheme */
  variant?: 'success' | 'warning';
  /** Additional CSS class names */
  className?: string;
}

/**
 * SkillBubble Component
 * 
 * A small, rounded badge component used to display skills, keywords, or tags.
 * Supports success (green) and warning (orange) color variants.
 * 
 * Features:
 * - Responsive text wrapping for long content
 * - Consistent styling with proper word breaking
 * - Color-coded variants for different types of content
 * 
 * @param props - The component props
 * @returns JSX element representing a skill bubble
 */
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
    display: 'inline-block',
    wordBreak: 'break-word' as const,
    overflowWrap: 'break-word' as const,
    maxWidth: '100%'
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