import type { ElementType, ReactNode } from 'react';
import React from 'react';
type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption';
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
export declare const Text: React.FC<TextProps>;
export {};
