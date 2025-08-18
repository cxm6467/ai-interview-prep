import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useDropzone } from 'react-dropzone';
import { Card } from '@atoms/Card';
import { Text } from '@atoms/Text';
import clsx from 'clsx';
import styles from './FileUpload.module.css';
export const FileUpload = ({ onDrop, file, accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
}, maxFiles = 1, label = 'Upload File', description = 'Drag & drop or click to browse', className, children, }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => onDrop(acceptedFiles),
        accept,
        maxFiles,
    });
    return (_jsx("div", { className: clsx(styles.container, className), children: children || (_jsxs(_Fragment, { children: [label && (_jsx(Text, { variant: "h3", className: styles.label, children: label })), _jsx(Card, { variant: "outlined", className: styles.dropzone, children: _jsxs("div", { ...getRootProps(), className: clsx(styles.dropzoneContent, isDragActive && styles.dragActive), children: [_jsx("input", { ...getInputProps() }), _jsxs("div", { className: styles.uploadContent, children: [_jsxs("svg", { className: styles.uploadIcon, width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M17 8L12 3L7 8", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M12 3V15", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })] }), _jsx(Text, { variant: "body", className: styles.uploadText, children: isDragActive ? 'Drop the files here' : description }), file && (_jsx(Text, { variant: "caption", className: styles.fileName, children: file.name }))] })] }) })] })) }));
};
