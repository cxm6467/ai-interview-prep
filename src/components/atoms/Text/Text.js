import { jsx as _jsx } from "react/jsx-runtime";
import clsx from 'clsx';
import styles from './Text.module.css';
export const Text = ({ children, variant = 'body', color = 'primary', align = 'left', weight = 'normal', className, as, }) => {
    const Component = as || (variant.startsWith('h') ? variant : 'p');
    return (_jsx(Component, { className: clsx(styles.text, styles[variant], styles[`color-${color}`], styles[`align-${align}`], styles[`weight-${weight}`], className), children: children }));
};
