/**
 * Cache Confirmation Modal
 * 
 * Modal dialog for asking users about cached file usage and analysis preferences
 */

import React from 'react';
import { Button, Text } from '@atoms';
import './CacheConfirmModal.css';

interface CacheConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileType: 'resume' | 'job';
  onUseCached: (useExistingAnalysis: boolean) => void;
  onParseFresh: () => void;
}

export const CacheConfirmModal: React.FC<CacheConfirmModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileType,
  onUseCached,
  onParseFresh
}) => {
  if (!isOpen) return null;

  const handleUseCached = (useExistingAnalysis: boolean) => {
    onUseCached(useExistingAnalysis);
    onClose();
  };

  const handleParseFresh = () => {
    onParseFresh();
    onClose();
  };

  return (
    <div className="cache-modal-overlay" onClick={onClose}>
      <div className="cache-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cache-modal-header">
          <Text variant="h3" className="cache-modal-title">
            📄 File Already Processed
          </Text>
          <button
            className="cache-modal-close"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="cache-modal-content">
          <div className="cache-modal-file-info">
            <Text variant="body" className="cache-modal-message">
              This {fileType} file <strong>"{fileName}"</strong> has been processed before.
            </Text>
          </div>

          <div className="cache-modal-options">
            <Text variant="h4" className="cache-modal-subtitle">
              What would you like to do?
            </Text>
            
            <div className="cache-modal-buttons">
              <div className="cache-option-group">
                <Text variant="small" className="cache-option-label">
                  Use cached version (instant):
                </Text>
                <div className="cache-option-buttons">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleUseCached(true)}
                    className="cache-option-btn"
                  >
                    📊 Use Existing Analysis
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleUseCached(false)}
                    className="cache-option-btn"
                  >
                    🔄 New Analysis (Cached File)
                  </Button>
                </div>
              </div>

              <div className="cache-option-divider">
                <Text variant="small" color="secondary">or</Text>
              </div>

              <div className="cache-option-group">
                <Text variant="small" className="cache-option-label">
                  Parse file again (ensures latest content):
                </Text>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={handleParseFresh}
                  className="cache-option-btn"
                >
                  🔄 Parse Fresh & New Analysis
                </Button>
              </div>
            </div>
          </div>

          <div className="cache-modal-info">
            <Text variant="small" color="secondary">
              💡 <strong>Tip:</strong> If you haven't modified the file, using cached content is much faster!
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheConfirmModal;