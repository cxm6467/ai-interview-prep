import React from 'react';
interface FileUploadProps {
    onDrop: (files: File[]) => void;
    file?: File | null;
    accept?: Record<string, string[]>;
    maxFiles?: number;
    label?: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
}
export declare const FileUpload: React.FC<FileUploadProps>;
export {};
