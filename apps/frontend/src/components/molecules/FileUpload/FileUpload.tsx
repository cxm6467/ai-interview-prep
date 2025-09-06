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
  children?: React.ReactNode;
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
  description = 'Drag & drop a single file or click to browse',
  className,
  children,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles),
    accept,
    maxFiles,
    multiple: false, // Explicitly disable multiple file selection
  });

  return (
    <div className={clsx(styles.container, className)}>
      {children || (
        <>
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
              <div className={styles.uploadContent}>
                <svg
                  className={styles.uploadIcon}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 8L12 3L7 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 3V15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <Text variant="body" className={styles.uploadText}>
                  {isDragActive ? 'Drop the files here' : description}
                </Text>
                {file && (
                  <Text variant="caption" className={styles.fileName}>
                    {file.name}
                  </Text>
                )}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
