import { useState } from 'react';
import { useNetwork } from '../../context/NetworkContext';

const NetworkIndicator = () => {
  // Don't render on server side
  if (typeof window === 'undefined') return null;

  const {
    networkStatus,
    retryAttempts,
    setShowNetworkModal,
    getNetworkSettings
  } = useNetwork();

  const [showTooltip, setShowTooltip] = useState(false);

  const getIndicatorColor = () => {
    if (!networkStatus.isOnline) return '#ef4444';
    
    switch (networkStatus.connectionQuality) {
      case 'excellent': return '#10b981';
      case 'good': return '#10b981';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Removed unused getIndicatorIcon function

  const getSignalBars = () => {
    if (!networkStatus.isOnline) return 0;
    
    switch (networkStatus.connectionQuality) {
      case 'excellent': return 4;
      case 'good': return 3;
      case 'fair': return 2;
      case 'poor': return 1;
      default: return 2;
    }
  };

  const handleClick = () => {
    if (networkStatus.connectionQuality === 'poor' || !networkStatus.isOnline) {
      setShowNetworkModal(true);
    }
  };

  const networkSettings = getNetworkSettings();

  // Always show a subtle indicator, but make it more prominent for issues
  const hasIssues = !networkStatus.isOnline ||
                   networkStatus.connectionQuality === 'poor' ||
                   retryAttempts > 0;

  return (
    <div
      className="network-indicator"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={hasIssues ? handleClick : undefined}
      style={{
        cursor: hasIssues ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: hasIssues ? '8px' : '6px',
        padding: hasIssues ? '8px 14px' : '6px 10px',
        borderRadius: '8px',
        background: hasIssues ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
        border: hasIssues ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.2s ease',
        minWidth: hasIssues ? '80px' : '60px'
      }}
    >
      {/* Signal bars - improved visibility */}
      <div style={{
        display: 'flex',
        alignItems: 'end',
        gap: '1.5px',
        height: hasIssues ? '16px' : '14px'
      }}>
        {[1, 2, 3, 4].map(bar => (
          <div
            key={bar}
            style={{
              width: hasIssues ? '3.5px' : '2.5px',
              height: `${bar * (hasIssues ? 3 : 2.5) + (hasIssues ? 4 : 3)}px`,
              backgroundColor: bar <= getSignalBars() ? getIndicatorColor() : 'rgba(255,255,255,0.2)',
              borderRadius: '1px',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Connection type badge - only show if issues or on hover */}
      {(hasIssues || showTooltip) && (
        <div style={{
          fontSize: '9px',
          fontWeight: '600',
          color: getIndicatorColor(),
          letterSpacing: '0.5px'
        }}>
          {networkStatus.effectiveType?.toUpperCase() || 'NET'}
        </div>
      )}

      {/* Retry indicator - compact */}
      {retryAttempts > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          fontSize: '8px',
          color: '#f59e0b'
        }}>
          <i className="fas fa-redo fa-spin"></i>
          <span>{retryAttempts}</span>
        </div>
      )}

      {/* Data saver indicator - only show if issues */}
      {networkSettings.enableDataSaver && hasIssues && (
        <div style={{
          fontSize: '8px',
          color: '#10b981'
        }}>
          <i className="fas fa-save"></i>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '12px',
          minWidth: '200px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#fff' }}>Network Status</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#ccc' }}>Status:</span>
              <span style={{ color: getIndicatorColor() }}>
                {networkStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#ccc' }}>Quality:</span>
              <span style={{ color: getIndicatorColor() }}>
                {networkStatus.connectionQuality}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#ccc' }}>Type:</span>
              <span style={{ color: '#fff' }}>{networkStatus.effectiveType || 'Unknown'}</span>
            </div>
            {networkStatus.downlink > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#ccc' }}>Speed:</span>
                <span style={{ color: '#fff' }}>{networkStatus.downlink.toFixed(1)} Mbps</span>
              </div>
            )}
            {retryAttempts > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#ccc' }}>Retries:</span>
                <span style={{ color: '#f59e0b' }}>{retryAttempts}</span>
              </div>
            )}
          </div>
          {hasIssues && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #333' }}>
              <small style={{ color: '#999' }}>Click for network help</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkIndicator;
