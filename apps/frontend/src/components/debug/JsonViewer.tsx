/**
 * JSON Viewer with syntax highlighting and collapsible nodes
 * Lightweight implementation without external dependencies
 */

import React, { useState, useEffect, useRef } from 'react';
import './JsonViewer.css';

interface JsonViewerProps {
  data: unknown;
  className?: string;
  maxHeight?: string;
}

interface JsonNodeProps {
  data: unknown;
  level: number;
  isLast?: boolean;
  parentKey?: string;
}

const JsonNode: React.FC<JsonNodeProps> = ({ data, level }) => {
  const [isCollapsed, setIsCollapsed] = useState(level > 2); // Auto-collapse deep objects
  const indent = '  '.repeat(level);

  if (data === null) {
    return <span className="json-null">null</span>;
  }

  if (typeof data === 'boolean') {
    return <span className="json-boolean">{data.toString()}</span>;
  }

  if (typeof data === 'number') {
    return <span className="json-number">{data}</span>;
  }

  if (typeof data === 'string') {
    // Handle long strings
    const displayStr = data.length > 100 ? `${data.substring(0, 100)}...` : data;
    return (
      <span className="json-string" title={data.length > 100 ? data : undefined}>
        "{displayStr}"
      </span>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="json-bracket">[]</span>;
    }

    return (
      <div className="json-array">
        <span className="json-bracket json-collapsible" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '▶' : '▼'} [{data.length} items] {isCollapsed && '...'}
        </span>
        {!isCollapsed && (
          <div className="json-content">
            {data.map((item, index) => (
              <div key={index} className="json-array-item">
                {indent}  <JsonNode data={item} level={level + 1} />
                {index < data.length - 1 && <span className="json-comma">,</span>}
              </div>
            ))}
            <div className="json-bracket">{indent}]</div>
          </div>
        )}
      </div>
    );
  }

  if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <span className="json-bracket">{'{}'}</span>;
    }

    return (
      <div className="json-object">
        <span className="json-bracket json-collapsible" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '▶' : '▼'} {'{'}
          {entries.length} {entries.length === 1 ? 'property' : 'properties'}
          {'}'}
          {isCollapsed && ' ...'}
        </span>
        {!isCollapsed && (
          <div className="json-content">
            {entries.map(([key, value], index) => (
              <div key={key} className="json-object-item">
                {indent}  <span className="json-key">"{key}"</span>
                <span className="json-colon">: </span>
                <JsonNode data={value} level={level + 1} />
                {index < entries.length - 1 && <span className="json-comma">,</span>}
              </div>
            ))}
            <div className="json-bracket">{indent}{'}'}</div>
          </div>
        )}
      </div>
    );
  }

  return <span className="json-unknown">{String(data)}</span>;
};

export const JsonViewer: React.FC<JsonViewerProps> = ({ 
  data, 
  className = '',
  maxHeight = '300px'
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close fullscreen
  useEffect(() => {
    if (!isFullScreen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (fullscreenRef.current && !fullscreenRef.current.contains(event.target as Node)) {
        setIsFullScreen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullScreen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isFullScreen]);

  return (
    <div className={`json-viewer-container ${className}`}>
      <div className="json-viewer-header">
        <button 
          className="json-viewer-expand-btn"
          onClick={() => setIsFullScreen(!isFullScreen)}
          title={isFullScreen ? "Exit fullscreen (ESC)" : "View fullscreen"}
          aria-label={isFullScreen ? "Exit fullscreen view" : "Open fullscreen view"}
        >
          <span className="json-viewer-icon" aria-hidden="true">
            {isFullScreen ? '✕' : '⛶'}
          </span>
        </button>
      </div>
      {isFullScreen && <div className="json-viewer-backdrop" />}
      <div 
        ref={fullscreenRef}
        className={`json-viewer ${isFullScreen ? 'json-viewer-fullscreen' : ''}`}
        style={{ maxHeight: isFullScreen ? '80vh' : maxHeight }}
        role="region"
        aria-label="JSON data viewer"
      >
        {isFullScreen && (
          <div className="json-viewer-fullscreen-header">
            <h3>JSON Viewer</h3>
            <button
              className="json-viewer-close-btn"
              onClick={() => setIsFullScreen(false)}
              title="Close fullscreen (ESC)"
              aria-label="Close fullscreen view"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        )}
        <div className="json-viewer-content">
          <JsonNode data={data} level={0} />
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;