import React from 'react';
import clsx from 'clsx';
import styles from './Text.module.css';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption';
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent';
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'medium' | 'bold';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight = 'normal',
  className,
  as,
}) => {
  const Component = as || (variant.startsWith('h') ? variant : 'p') as keyof JSX.IntrinsicElements;
  
  return (
    <Component
      className={clsx(
        styles.text,
        styles[variant],
        styles[`color-${color}`],
        styles[`align-${align}`],
        styles[`weight-${weight}`],
        className
      )}
    >
      {children}
    </Component>
  );
};
