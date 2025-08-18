import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@atoms/Card';
import { Text } from '@atoms/Text';
import clsx from 'clsx';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onDrop: (files: File[]) => void;
  file?: File | null;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  label?: string;
  description?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onDrop,
  file,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxFiles = 1,
  label = 'Upload File',
  description = 'Drag & drop or click to browse',
  className,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles),
    accept,
    maxFiles,
  });

  return (
    <div className={clsx(styles.container, className)}>
      {label && (
        <Text variant="h3" className={styles.label}>
          {label}
        </Text>
      )}
      <Card variant="outlined" className={styles.dropzone}>
        <div
          {...getRootProps()}
          className={clsx(
            styles.dropzoneContent,
            isDragActive && styles.dragActive
          )}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className={styles.fileInfo}>
              <span className={styles.fileIcon}>📎</span>
              <Text variant="body">{file.name}</Text>
              <Text variant="caption" color="secondary">
                {(file.size / 1024).toFixed(1)} KB
              </Text>
            </div>
          ) : (
            <div className={styles.uploadPrompt}>
              <span className={styles.uploadIcon}>⬆️</span>
              <Text variant="body" align="center">
                {isDragActive ? 'Drop file here' : description}
              </Text>
              <Text variant="caption" color="secondary" align="center">
                Supports PDF, DOC, DOCX
              </Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
