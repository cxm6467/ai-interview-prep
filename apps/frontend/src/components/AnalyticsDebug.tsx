import React, { useState } from 'react';
import { getAnalyticsStatus } from '../utils/analytics';

const AnalyticsDebug: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const status = getAnalyticsStatus();
  
  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      zIndex: 1000
    }}>
      <button 
        onClick={() => setIsVisible(!isVisible)}
        style={{
          background: status.configured ? '#2d5a27' : '#5a2727',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        📊 Analytics {status.configured ? '✅' : '❌'}
      </button>
      
      {isVisible && (
        <div style={{
          position: 'absolute',
          bottom: '40px',
          right: '0',
          background: status.configured ? '#2d5a27' : '#5a2727',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          minWidth: '200px',
          border: `2px solid ${status.configured ? '#4caf50' : '#f44336'}`
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            Analytics Status
          </div>
          
          <div>Environment: {status.environment}</div>
          <div>Subdomain: {status.subdomain}</div>
          <div>GA ID: {status.gaId}</div>
          <div>Configured: {status.configured ? '✅' : '❌'}</div>
          <div>Enabled: {status.enabled ? '✅' : '❌'}</div>
          
          {!status.configured && (
            <div style={{ 
              marginTop: '8px', 
              padding: '6px', 
              background: '#633',
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              ⚠️ GA measurement ID not configured
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDebug;