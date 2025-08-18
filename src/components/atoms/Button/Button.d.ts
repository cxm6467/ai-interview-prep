import React from 'react';
interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}
export declare const Button: React.FC<ButtonProps>;
export {};
