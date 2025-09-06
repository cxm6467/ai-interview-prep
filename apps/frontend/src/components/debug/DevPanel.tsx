/**
 * Development Debug Panel
 * 
 * Provides comprehensive debugging information and REST API monitoring
 * for the AI Interview Prep application. Only shows in development.
 */

import React, { useState, useEffect } from 'react';
import { Button, Text } from '@atoms';
import { useAppStore } from '@/store/appStore';
import { APIMonitor } from '@/services/progressService';
import type { APICallInfo } from '@/services/progressService';
import { DadJokeService } from '@/services/dadJokeService';
import { cacheMonitor, CacheServiceUtils } from '@/services/cacheService';
import type { CacheStats, CacheEntryInfo } from '@/services/cacheService';
import { piiAuditService, PIIAuditUtils } from '@/services/piiAuditService';
import type { PIIAuditEntry, PIIAuditStats } from '@/services/piiAuditService';
import { fileCacheService, FileCacheUtils } from '@/services/fileCacheService';
import type { CachedFileEntry, FileCacheStats } from '@/services/fileCacheService';
import JsonViewer from './JsonViewer';
import './DevPanel.css';



interface DevPanelProps {
  userMode?: boolean;
}

export const DevPanel: React.FC<DevPanelProps> = ({ userMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState(userMode ? 'performance' : 'state');
  const [apiCalls, setApiCalls] = useState<APICallInfo[]>([]);
  const [jokeStats, setJokeStats] = useState<{ used: number; cached: number; cacheExpiry: string | null }>({ used: 0, cached: 0, cacheExpiry: null });
  const [cacheStats, setCacheStats] = useState<CacheStats>({ hits: 0, misses: 0, hitRate: 0, totalEntries: 0, memoryUsage: 0 });
  const [cacheEntries, setCacheEntries] = useState<CacheEntryInfo[]>([]);
  const [piiAuditEntries, setPiiAuditEntries] = useState<PIIAuditEntry[]>([]);
  const [piiAuditStats, setPiiAuditStats] = useState<PIIAuditStats>({ totalOperations: 0, criticalPIIBlocked: 0, totalPIIItemsFound: 0, cacheBlockedDueToPII: 0, averageProcessingTime: 0, topPIICategories: [] });
  const [fileCacheEntries, setFileCacheEntries] = useState<CachedFileEntry[]>([]);
  const [fileCacheStats, setFileCacheStats] = useState<FileCacheStats>({ totalFiles: 0, totalSize: 0, cacheHits: 0, cacheMisses: 0, hitRate: 0 });

  const store = useAppStore();

  // Listen to real API calls
  useEffect(() => {
    setApiCalls(APIMonitor.getCalls());
    const unsubscribe = APIMonitor.addListener(setApiCalls);
    return unsubscribe;
  }, []);

  // Update joke stats periodically
  useEffect(() => {
    const updateJokeStats = () => {
      setJokeStats(DadJokeService.getJokeStats());
    };
    
    updateJokeStats(); // Initial update
    const interval = setInterval(updateJokeStats, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Listen to cache stats and entries
  useEffect(() => {
    setCacheStats(cacheMonitor.getStats());
    setCacheEntries(cacheMonitor.getEntries());
    
    const unsubscribeStats = cacheMonitor.addStatsListener(setCacheStats);
    const unsubscribeEntries = cacheMonitor.addEntriesListener(setCacheEntries);
    
    return () => {
      unsubscribeStats();
      unsubscribeEntries();
    };
  }, []);

  // Listen to PII audit data
  useEffect(() => {
    setPiiAuditEntries(piiAuditService.getAuditEntries());
    setPiiAuditStats(piiAuditService.getStats());
    
    const unsubscribeAuditEntries = piiAuditService.addEntriesListener(setPiiAuditEntries);
    const unsubscribeAuditStats = piiAuditService.addStatsListener(setPiiAuditStats);
    
    return () => {
      unsubscribeAuditEntries();
      unsubscribeAuditStats();
    };
  }, []);

  // Listen to file cache data
  useEffect(() => {
    setFileCacheEntries(fileCacheService.getCachedFiles());
    setFileCacheStats(fileCacheService.getStats());
    
    const unsubscribeFileEntries = fileCacheService.addEntriesListener(setFileCacheEntries);
    const unsubscribeFileStats = fileCacheService.addStatsListener(setFileCacheStats);
    
    return () => {
      unsubscribeFileEntries();
      unsubscribeFileStats();
    };
  }, []);

  // Generate today's password (M)D(D)YYYY format without leading zeros
  const generateTodaysPassword = (): string => {
    const today = new Date();
    const month = today.getMonth() + 1; // getMonth() returns 0-11
    const day = today.getDate();
    const year = today.getFullYear();
    return `${month}${day}${year}`;
  };

  // Check if debug panel should be shown
  const isDebugEnabled = import.meta.env.VITE_ENABLE_DEBUG_PANEL === 'true';
  const shouldShowUnlockButton = !isDebugEnabled && !isUnlocked;
  const shouldShowPanel = isDebugEnabled || isUnlocked;

  // Handle password submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = generateTodaysPassword();
    
    if (passwordInput === correctPassword) {
      setIsUnlocked(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
      setIsOpen(true); // Auto-open panel after unlock
    } else {
      const hints = [
        "🤔 Think about what day it is... but don't think too hard!",
        "📅 The answer changes every day, like your morning coffee preference!",
        "🌅 Today's date holds the key, without those pesky leading zeros!",
        "🔢 Month, day, year... all smooshed together like a good sandwich!",
        "⏰ Time is the answer, but format matters more than you think!"
      ];
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      setPasswordError(randomHint);
    }
  };

  // Don't show anything if debug is disabled and not unlocked
  if (!shouldShowPanel && !shouldShowUnlockButton) {
    return null;
  }


  const clearApiCalls = () => APIMonitor.clearCalls();

  const envVars = {
    NODE_ENV: import.meta.env.MODE,
    VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
    VITE_ENABLE_CONSOLE_LOGS: import.meta.env.VITE_ENABLE_CONSOLE_LOGS,
    VITE_ENABLE_DEBUG_PANEL: import.meta.env.VITE_ENABLE_DEBUG_PANEL,
    BASE_URL: import.meta.env.BASE_URL,
    DEV: import.meta.env.DEV.toString(),
    PROD: import.meta.env.PROD.toString()
  };

  return (
    <>
      {/* Toggle Button or Unlock Button */}
      {shouldShowPanel ? (
        <button
          className="dev-panel-toggle"
          onClick={() => setIsOpen(!isOpen)}
          title="Toggle Debug Panel"
        >
          🔧
        </button>
      ) : shouldShowUnlockButton ? (
        <button
          className={`dev-panel-unlock ${import.meta.env.DEV ? 'dev-visible' : 'prod-invisible'}`}
          onClick={() => setShowPasswordModal(true)}
          title="🔓 Secret Debug Panel"
        >
          🔧
        </button>
      ) : null}
      
      {/* Password Unlock Modal */}
      {showPasswordModal && (
        <div className="dev-panel-password-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="dev-panel-password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dev-panel-password-header">
              <Text variant="h4">🔓 Debug Panel Unlock</Text>
              <button
                className="dev-panel-close"
                onClick={() => setShowPasswordModal(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="dev-panel-password-content">
              <div style={{ marginBottom: '16px' }}>
                <Text variant="body">
                  Enter today's password to unlock the debug panel
                </Text>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="text"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Password..."
                  className="dev-panel-password-input"
                  autoFocus
                />
                <div className="dev-panel-password-actions">
                  <Button type="submit" variant="primary" size="small">
                    Unlock
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
              {passwordError && (
                <div className="dev-panel-password-error">
                  <Text variant="small" color="secondary">
                    {passwordError}
                  </Text>
                </div>
              )}
              <div className="dev-panel-password-riddle">
                <Text variant="small" color="secondary">
                  💡 <strong>Riddle:</strong> Don't think too hard about today... 
                  the answer is right in front of you, formatted just right!
                </Text>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {isOpen && shouldShowPanel && (
        <div className="dev-panel">
          <div className="dev-panel-header">
            <Text variant="h3" className="dev-panel-title">
              {userMode ? '📊 Performance Monitor' : '🔧 Debug Panel'}
            </Text>
            <button
              className="dev-panel-close"
              onClick={() => setIsOpen(false)}
              title="Close Debug Panel"
            >
              ✕
            </button>
          </div>

          <div className="dev-panel-tabs">
            {userMode ? (
              <>
                <button 
                  className={`dev-panel-tab ${activeTab === 'performance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('performance')}
                >
                  Performance
                </button>
                <button 
                  className={`dev-panel-tab ${activeTab === 'cache' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cache')}
                >
                  Analysis Cache
                </button>
                <button 
                  className={`dev-panel-tab ${activeTab === 'files' ? 'active' : ''}`}
                  onClick={() => setActiveTab('files')}
                >
                  File Cache
                </button>
              </>
            ) : (
              <>
                <button 
                  className={`dev-panel-tab ${activeTab === 'state' ? 'active' : ''}`}
                  onClick={() => setActiveTab('state')}
                >
                  App State
                </button>
                <button 
                  className={`dev-panel-tab ${activeTab === 'api' ? 'active' : ''}`}
                  onClick={() => setActiveTab('api')}
                >
                  API Calls
                </button>
                <button 
                  className={`dev-panel-tab ${activeTab === 'env' ? 'active' : ''}`}
                  onClick={() => setActiveTab('env')}
                >
                  Environment
                </button>
                <button 
                  className={`dev-panel-tab ${activeTab === 'cache' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cache')}
                >
                  Analysis Cache
                </button>
                <button 
                  className={`dev-panel-tab ${activeTab === 'files' ? 'active' : ''}`}
                  onClick={() => setActiveTab('files')}
                >
                  File Cache
                </button>
                <button 
                  className={`dev-panel-tab ${activeTab === 'pii' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pii')}
                >
                  PII Audit
                </button>
              </>
            )}
          </div>

          <div className="dev-panel-content">
            {activeTab === 'performance' && userMode && (
              <div className="dev-panel-section">
                <Text variant="h4" className="section-title">Performance Overview</Text>
                <div className="state-grid">
                  <div className="state-item">
                    <span className="state-label">Analysis Cache Hit Rate:</span>
                    <span className="state-value">{Math.round(cacheStats.hitRate * 100)}%</span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">Total Cached Analyses:</span>
                    <span className="state-value">{cacheStats.totalEntries}</span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">File Cache Hit Rate:</span>
                    <span className="state-value">{Math.round(fileCacheStats.hitRate * 100)}%</span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">Cached Files:</span>
                    <span className="state-value">{fileCacheStats.totalFiles}</span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">Cache Memory Usage:</span>
                    <span className="state-value">{FileCacheUtils.formatFileSize(fileCacheStats.totalSize)}</span>
                  </div>
                </div>
                
                <Text variant="h4" className="section-title performance-section">Recent Performance</Text>
                <div className="performance-metrics">
                  {apiCalls.filter(call => call.status >= 200 && call.status < 300 && call.duration !== undefined).slice(-3).map(call => (
                    <div key={call.id} className="performance-item">
                      <div className="performance-endpoint">{call.method} {call.url}</div>
                      <div className="performance-timing">
                        <span className="performance-duration">{call.duration}ms</span>
                        <span className="performance-status success">✓ Success</span>
                      </div>
                    </div>
                  ))}
                  {apiCalls.filter(call => call.status >= 200 && call.status < 300 && call.duration !== undefined).length === 0 && (
                    <div className="no-data">No recent API calls to show</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'state' && !userMode && (
              <div className="dev-panel-section">
                <Text variant="h4" className="section-title">Application State</Text>
                <div className="state-grid">
                  <div className="state-item">
                    <span className="state-label">Current Step:</span>
                    <span className="state-value">{store.currentStep}</span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">Theme:</span>
                    <span className="state-value">{store.theme}</span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">Questions:</span>
                    <span className="state-value">{store.interviewQuestions.length}</span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">Topics:</span>
                    <span className="state-value">{store.presentationTopics.length}</span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">ATS Score:</span>
                    <span className="state-value">{store.atsScore?.score || 'N/A'}</span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">Interviewer Role:</span>
                    <span className="state-value">{store.interviewerRole || 'None'}</span>
                  </div>
                  <div className="state-item state-item-multiline">
                    <span className="state-label">Current Dad Joke:</span>
                    <span className="state-value state-joke-text" title={store.currentDadJoke || undefined}>
                      {store.currentDadJoke ? store.currentDadJoke.substring(0, 120) + (store.currentDadJoke.length > 120 ? '...' : '') : 'None'}
                    </span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">Cached Jokes:</span>
                    <span className="state-value">{jokeStats.cached} jokes ({jokeStats.used} used)</span>
                  </div>
                </div>
                <details className="state-details">
                  <summary>Full State (JSON)</summary>
                  <div className="state-json-viewer">
                    <JsonViewer data={store} maxHeight="400px" />
                  </div>
                </details>
              </div>
            )}

            {activeTab === 'api' && !userMode && (
              <div className="dev-panel-section">
                <div className="section-header">
                  <Text variant="h4" className="section-title">REST API Monitoring</Text>
                  <div className="section-actions">
                    <Button size="small" variant="secondary" onClick={clearApiCalls}>
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="api-features-info">
                  <Text variant="small" color="secondary">
                    🚀 <strong>New REST Features:</strong> Partial analysis via query params (?include=atsScore,technicalQuestions), 
                    progress tracking, HTTP caching with ETags
                  </Text>
                </div>
                <div className="api-calls-list">
                  {apiCalls.length === 0 ? (
                    <Text color="secondary">No API calls tracked yet</Text>
                  ) : (
                    apiCalls.map(call => (
                      <div key={call.id} className="api-call-item">
                        <div className="api-call-header">
                          <span className={`api-method ${call.method.toLowerCase()}`}>
                            {call.method}
                          </span>
                          <span className="api-url">{call.url}</span>
                          <div className="api-badges">
                            {call.cached && <span className="api-badge cached">Cached</span>}
                            {call.partial && <span className="api-badge partial">Partial</span>}
                          </div>
                        </div>
                        <div className="api-call-details">
                          <span className={`api-status status-${Math.floor(call.status / 100)}`}>
                            {call.status}
                          </span>
                          <span className="api-duration">{call.duration.toFixed(0)}ms</span>
                          <span className="api-timestamp">
                            {call.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        {call.components && (
                          <div className="api-components">
                            Components: {call.components.join(', ')}
                          </div>
                        )}
                        {(call.requestBody != null || call.responseBody != null || 
                          (call.requestHeaders && Object.keys(call.requestHeaders).length > 0) ||
                          (call.responseHeaders && Object.keys(call.responseHeaders).length > 0)) && (
                          <details className="api-details">
                            <summary>
                              {call.method === 'GET' ? 'Response Details' : 'Request/Response Details'}
                            </summary>
                            <div className="api-details-content">
                              {/* Only show request body for POST/PUT/PATCH methods */}
                              {(call.method === 'POST' || call.method === 'PUT' || call.method === 'PATCH') && call.requestBody != null && (
                                <div className="api-detail-section">
                                  <h5>Request Body:</h5>
                                  <JsonViewer 
                                    data={call.requestBody} 
                                    maxHeight="200px"
                                    className="api-detail-json-viewer" 
                                  />
                                </div>
                              )}
                              
                              {/* Always show response body if available */}
                              {call.responseBody != null && (
                                <div className="api-detail-section">
                                  <h5>Response Body:</h5>
                                  <JsonViewer 
                                    data={call.responseBody} 
                                    maxHeight="200px"
                                    className="api-detail-json-viewer" 
                                  />
                                </div>
                              )}
                              
                              {/* Show request headers for POST/PUT/PATCH methods */}
                              {(call.method === 'POST' || call.method === 'PUT' || call.method === 'PATCH') && 
                                call.requestHeaders && Object.keys(call.requestHeaders).length > 0 && (
                                <div className="api-detail-section">
                                  <h5>Request Headers:</h5>
                                  <JsonViewer 
                                    data={call.requestHeaders} 
                                    maxHeight="150px"
                                    className="api-detail-json-viewer" 
                                  />
                                </div>
                              )}
                              
                              {/* Always show response headers if available */}
                              {call.responseHeaders && Object.keys(call.responseHeaders).length > 0 && (
                                <div className="api-detail-section">
                                  <h5>Response Headers:</h5>
                                  <JsonViewer 
                                    data={call.responseHeaders} 
                                    maxHeight="150px"
                                    className="api-detail-json-viewer" 
                                  />
                                </div>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}



            {activeTab === 'env' && !userMode && (
              <div className="dev-panel-section">
                <Text variant="h4" className="section-title">Environment Variables</Text>
                <div className="env-list">
                  {Object.entries(envVars).map(([key, value]) => (
                    <div key={key} className="env-item">
                      <span className="env-key">{key}:</span>
                      <span className="env-value">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'cache' && (
              <div className="dev-panel-section">
                <div className="section-header">
                  <Text variant="h4" className="section-title">PII-Safe Cache Monitoring</Text>
                  <div className="section-actions">
                    <Button size="small" variant="secondary" onClick={() => cacheMonitor.cleanup()}>
                      Cleanup
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => cacheMonitor.clearCache()}>
                      Clear All
                    </Button>
                  </div>
                </div>
                
                <div className="cache-stats">
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Hit Rate:</span>
                    <span className="cache-stat-value cache-hit-rate">
                      {Math.round(cacheStats.hitRate * 100)}%
                    </span>
                  </div>
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Total Hits:</span>
                    <span className="cache-stat-value">{cacheStats.hits}</span>
                  </div>
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Total Misses:</span>
                    <span className="cache-stat-value">{cacheStats.misses}</span>
                  </div>
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Entries:</span>
                    <span className="cache-stat-value">{cacheStats.totalEntries}</span>
                  </div>
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Memory:</span>
                    <span className="cache-stat-value">
                      {CacheServiceUtils.formatMemorySize(cacheStats.memoryUsage)}
                    </span>
                  </div>
                </div>

                <div className="cache-features-info">
                  <Text variant="small" color="secondary">
                    🔒 <strong>PII-Safe Caching:</strong> Only scrubbed, non-sensitive data is cached. 
                    Critical PII blocks caching automatically.
                  </Text>
                </div>

                <div className="cache-entries">
                  {cacheEntries.length === 0 ? (
                    <div className="cache-empty">
                      <Text color="secondary">No cache entries</Text>
                    </div>
                  ) : (
                    cacheEntries.map((entry) => {
                      const expiryStatus = CacheServiceUtils.getExpiryStatus(entry.expiresAt);
                      return (
                        <div key={entry.key} className="cache-entry">
                          <div className="cache-entry-header">
                            <div className="cache-entry-key">
                              <span className="cache-key-text">
                                {CacheServiceUtils.formatCacheKey(entry.key)}
                              </span>
                              <span className={`cache-entry-type ${entry.type}`}>
                                {entry.type}
                              </span>
                            </div>
                            <div className="cache-entry-stats">
                              <span className="cache-entry-size">
                                {CacheServiceUtils.formatMemorySize(entry.size)}
                              </span>
                              <span className="cache-entry-access">
                                {entry.accessCount} hits
                              </span>
                            </div>
                          </div>
                          <div className="cache-entry-details">
                            <span className="cache-entry-created">
                              Created: {CacheServiceUtils.formatTimeAgo(entry.createdAt)}
                            </span>
                            <span className="cache-entry-accessed">
                              Last accessed: {CacheServiceUtils.formatTimeAgo(entry.lastAccessed)}
                            </span>
                            <span className={`cache-entry-expiry ${expiryStatus.status}`}>
                              {expiryStatus.timeLeft}
                            </span>
                            <span className="cache-entry-pii">
                              {entry.piiScrubbed ? '🔒 PII Scrubbed' : '⚠️ Not Scrubbed'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="dev-panel-section">
                <div className="section-header">
                  <Text variant="h4" className="section-title">File Upload Cache</Text>
                  <div className="section-actions">
                    <Button size="small" variant="secondary" onClick={() => fileCacheService.clearCache()}>
                      Clear Cache
                    </Button>
                  </div>
                </div>
                
                <div className="cache-stats">
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Files Cached:</span>
                    <span className="cache-stat-value">{fileCacheStats.totalFiles}</span>
                  </div>
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Hit Rate:</span>
                    <span className="cache-stat-value cache-hit-rate">
                      {Math.round(fileCacheStats.hitRate * 100)}%
                    </span>
                  </div>
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Cache Size:</span>
                    <span className="cache-stat-value">
                      {FileCacheUtils.formatFileSize(fileCacheStats.totalSize)}
                    </span>
                  </div>
                </div>

                <div className="cache-features-info">
                  <Text variant="small" color="secondary">
                    📄 <strong>File Caching:</strong> Parsed content is cached based on file content hash. 
                    Identical files are instantly retrieved from cache.
                  </Text>
                </div>

                <div className="cache-entries">
                  {fileCacheEntries.length === 0 ? (
                    <div className="cache-empty">
                      <Text color="secondary">No cached files</Text>
                    </div>
                  ) : (
                    fileCacheEntries.map((entry) => (
                      <div key={entry.fileHash} className="cache-entry">
                        <div className="cache-entry-header">
                          <div className="cache-entry-key">
                            <span className="cache-key-text">
                              {FileCacheUtils.getFileTypeIcon(entry.fileType)} {FileCacheUtils.formatFileName(entry.fileName)}
                            </span>
                            <span className="cache-entry-type file">
                              {entry.fileType.split('/')[1] || 'file'}
                            </span>
                          </div>
                          <div className="cache-entry-stats">
                            <span className="cache-entry-size">
                              {FileCacheUtils.formatFileSize(entry.fileSize)}
                            </span>
                            <span className="cache-entry-access">
                              {entry.accessCount} hits
                            </span>
                          </div>
                        </div>
                        <div className="cache-entry-details">
                          <span className="cache-entry-accessed">
                            Last used: {CacheServiceUtils.formatTimeAgo(entry.lastAccessed)}
                          </span>
                          <span className="cache-entry-content">
                            Content: {entry.parsedContent.length} chars
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'pii' && !userMode && (
              <div className="dev-panel-section">
                <div className="section-header">
                  <Text variant="h4" className="section-title">PII Scrubbing Audit</Text>
                  <div className="section-actions">
                    <Button size="small" variant="secondary" onClick={() => piiAuditService.clearAuditEntries()}>
                      Clear Audit
                    </Button>
                  </div>
                </div>
                
                <div className="cache-stats">
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Operations:</span>
                    <span className="cache-stat-value">{piiAuditStats.totalOperations}</span>
                  </div>
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Critical PII:</span>
                    <span className="cache-stat-value" style={{ color: 'var(--color-error)' }}>
                      {piiAuditStats.criticalPIIBlocked}
                    </span>
                  </div>
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Total PII:</span>
                    <span className="cache-stat-value">{piiAuditStats.totalPIIItemsFound}</span>
                  </div>
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Cache Blocked:</span>
                    <span className="cache-stat-value" style={{ color: 'var(--color-warning)' }}>
                      {piiAuditStats.cacheBlockedDueToPII}
                    </span>
                  </div>
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Avg Process:</span>
                    <span className="cache-stat-value">{piiAuditStats.averageProcessingTime}ms</span>
                  </div>
                </div>

                <div className="cache-features-info">
                  <Text variant="small" color="secondary">
                    🔒 <strong>PII Protection:</strong> Shows what types of PII were detected and scrubbed. 
                    No actual sensitive content is displayed.
                  </Text>
                </div>

                <div className="cache-entries">
                  {piiAuditEntries.length === 0 ? (
                    <div className="cache-empty">
                      <Text color="secondary">No PII operations recorded</Text>
                    </div>
                  ) : (
                    piiAuditEntries.map((entry) => (
                      <div key={entry.id} className="cache-entry">
                        <div className="cache-entry-header">
                          <div className="cache-entry-key">
                            <span className="cache-key-text">
                              {PIIAuditUtils.formatSourceType(entry.sourceType)}
                            </span>
                            <span className={`cache-entry-type ${entry.hasCriticalPII ? 'critical' : 'safe'}`}>
                              {entry.hasCriticalPII ? 'Critical' : 'Safe'}
                            </span>
                          </div>
                          <div className="cache-entry-stats">
                            <span className="cache-entry-size">
                              -{PIIAuditUtils.calculateReductionPercentage(entry.originalLength, entry.scrubbedLength)}%
                            </span>
                            <span className="cache-entry-access">
                              {entry.processingDuration}ms
                            </span>
                          </div>
                        </div>
                        <div className="cache-entry-details">
                          <span className="cache-entry-created">
                            {PIIAuditUtils.formatTimeAgo(entry.timestamp)}
                          </span>
                          <span className={`cache-entry-cached ${entry.cached ? 'cached' : 'not-cached'}`}>
                            {entry.cached ? '✓ Cached' : '✗ Not Cached'}
                          </span>
                          <div className="pii-categories" style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                            {entry.piiFound.length === 0 ? (
                              <span className="pii-category-none">No PII detected</span>
                            ) : (
                              entry.piiFound.map((pii, idx) => (
                                <span key={idx} className="pii-category-tag">
                                  {PIIAuditUtils.getCategoryIcon(pii.category)} 
                                  {PIIAuditUtils.formatPIICategory(pii.category)} ({pii.count})
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DevPanel;