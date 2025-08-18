import React from 'react';
interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'small' | 'medium' | 'large';
    variant?: 'default' | 'elevated' | 'outlined';
    onClick?: () => void;
}
export declare const Card: React.FC<CardProps>;
export {};
