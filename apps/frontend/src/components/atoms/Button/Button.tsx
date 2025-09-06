import React from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

/**
 * Button component properties
 * 
 * @interface ButtonProps
 */
interface ButtonProps {
  /** The content to display inside the button */
  children: React.ReactNode;
  /** Click handler function */
  onClick?: () => void;
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  /** Size of the button */
  size?: 'small' | 'medium' | 'large';
  /** Whether the button should take full width of its container */
  fullWidth?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Optional icon to display alongside text */
  icon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Button HTML type attribute */
  type?: 'button' | 'submit' | 'reset';
  // Accessibility props
  role?: string;
  'aria-selected'?: boolean;
  'aria-controls'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  tabIndex?: number;
  title?: string;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

/**
 * Reusable Button Component
 * 
 * A flexible button component with multiple variants, sizes, and states.
 * Built with accessibility in mind and follows the atomic design pattern.
 * 
 * Features:
 * - Multiple visual variants (primary, secondary, ghost)
 * - Responsive sizing (small, medium, large)
 * - Icon support with proper spacing
 * - Touch-friendly minimum targets (44px)
 * - Hover and focus states
 * - Disabled state handling
 * - Full width option for mobile layouts
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <Button onClick={handleClick}>Click me</Button>
 * 
 * // With variant and size
 * <Button variant="secondary" size="large">Large Secondary</Button>
 * 
 * // With icon
 * <Button icon={<FiUpload />}>Upload File</Button>
 * ```
 * 
 * @param {ButtonProps} props - The button component props
 * @returns {JSX.Element} The rendered button element
 */
export const Button: React.FC<ButtonProps> = React.memo(({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  icon,
  className,
  style,
  type = 'button',
  role,
  'aria-selected': ariaSelected,
  'aria-controls': ariaControls,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  tabIndex,
  title,
  onKeyDown,
}) => {
  return (
    <button
      type={type}
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className
      )}
      style={style}
      onClick={onClick}
      onKeyDown={onKeyDown}
      disabled={disabled}
      role={role}
      aria-selected={ariaSelected}
      aria-controls={ariaControls}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      tabIndex={tabIndex}
      title={title}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{children}</span>
    </button>
  );
});
