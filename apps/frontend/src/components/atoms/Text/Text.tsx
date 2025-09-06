import type { ElementType, ReactNode } from 'react';
import React from 'react';
import clsx from 'clsx';
import styles from './Text.module.css';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'caption';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'accent';
type TextAlign = 'left' | 'center' | 'right';
type TextWeight = 'normal' | 'medium' | 'bold';

interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  align?: TextAlign;
  weight?: TextWeight;
  className?: string;
  as?: ElementType;
}

export const Text: React.FC<TextProps> = React.memo(({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight = 'normal',
  className,
  as,
}) => {
  const Component = as || (variant.startsWith('h') ? variant : 'p');
  
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
});
