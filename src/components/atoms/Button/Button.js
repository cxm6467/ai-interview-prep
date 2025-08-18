import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
import styles from './Button.module.css';
export const Button = ({ children, onClick, variant = 'primary', size = 'medium', fullWidth = false, disabled = false, icon, className, type = 'button', }) => {
    return (_jsxs("button", { type: type, className: clsx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className), onClick: onClick, disabled: disabled, children: [icon && _jsx("span", { className: styles.icon, children: icon }), _jsx("span", { className: styles.text, children: children })] }));
};
