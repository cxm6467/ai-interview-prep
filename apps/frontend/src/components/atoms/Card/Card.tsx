import React from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  variant?: 'default' | 'elevated' | 'outlined';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = React.memo(({
  children,
  className,
  padding = 'medium',
  variant = 'default',
  onClick,
}) => {
  return (
    <div 
      className={clsx(
        styles.card,
        styles[variant],
        styles[`padding-${padding}`],
        onClick && styles.clickable,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
});
