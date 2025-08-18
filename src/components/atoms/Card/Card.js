import { jsx as _jsx } from "react/jsx-runtime";
import clsx from 'clsx';
import styles from './Card.module.css';
export const Card = ({ children, className, padding = 'medium', variant = 'default', onClick, }) => {
    return (_jsx("div", { className: clsx(styles.card, styles[variant], styles[`padding-${padding}`], onClick && styles.clickable, className), onClick: onClick, children: children }));
};
