import React, { useState, useEffect } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import styles from './NetworkModal.module.css';

const NetworkModal = () => {
  const {
    networkStatus,
    showNetworkModal,
    setShowNetworkModal,
    retryAttempts,
    updateNetworkInfo,
    getNetworkSettings
  } = useNetwork();

  const [isRetrying, setIsRetrying] = useState(false);
  const [tips, setTips] = useState([]);

  // Don't render on server side
  if (typeof window === 'undefined') return null;

  const networkSettings = getNetworkSettings();

  // Network improvement tips based on connection quality
  const getNetworkTips = () => {
    const { connectionQuality, effectiveType, isOnline } = networkStatus;
    
    if (!isOnline) {
      return [
        "Check your WiFi or mobile data connection",
        "Try switching between WiFi and mobile data",
        "Move to an area with better signal strength",
        "Restart your router or mobile data"
      ];
    }

    if (connectionQuality === 'poor') {
      return [
        "Close other apps using internet",
        "Move closer to your WiFi router",
        "Switch to a different WiFi network if available",
        "Try using mobile data instead of WiFi",
        "Clear your browser cache",
        "Disable automatic app updates"
      ];
    }

    if (connectionQuality === 'fair') {
      return [
        "Close unnecessary browser tabs",
        "Pause video streaming or downloads",
        "Move to a location with better signal",
        "Try refreshing the page"
      ];
    }

    return ["Your connection looks good!"];
  };

  useEffect(() => {
    setTips(getNetworkTips());
  }, [networkStatus]);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update network info
      updateNetworkInfo();
      
      // If connection improved, close modal
      if (networkStatus.connectionQuality !== 'poor' && networkStatus.isOnline) {
        setShowNetworkModal(false);
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleContinueAnyway = () => {
    setShowNetworkModal(false);
  };

  const getConnectionIcon = () => {
    if (!networkStatus.isOnline) return '📵';
    
    switch (networkStatus.connectionQuality) {
      case 'excellent': return '📶';
      case 'good': return '📶';
      case 'fair': return '📶';
      case 'poor': return '📶';
      default: return '📶';
    }
  };

  const getConnectionColor = () => {
    if (!networkStatus.isOnline) return '#ef4444';
    
    switch (networkStatus.connectionQuality) {
      case 'excellent': return '#10b981';
      case 'good': return '#10b981';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Only show modal for offline connections or very poor connections
  if (!showNetworkModal || (!networkStatus.isOnline === false && networkStatus.connectionQuality !== 'poor')) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        border: '1px solid #333',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px',
          color: !networkStatus.isOnline ? '#ef4444' : '#f59e0b'
        }}>
          {!networkStatus.isOnline ? '📵' : '📶'}
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          color: '#fff'
        }}>
          {!networkStatus.isOnline ? 'No Internet Connection' : 'Slow Connection Detected'}
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#ccc',
          margin: '0 0 24px 0',
          lineHeight: '1.5'
        }}>
          {!networkStatus.isOnline
            ? 'Please check your internet connection and try again'
            : 'Your connection is slow. The app will automatically optimize for better performance.'
          }
        </p>

        {!networkStatus.isOnline && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 12px 0',
              color: '#E0AD6B'
            }}>
              Quick Fixes:
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              textAlign: 'left'
            }}>
              <li style={{ marginBottom: '8px', fontSize: '14px', color: '#ddd' }}>
                • Check your WiFi or mobile data
              </li>
              <li style={{ marginBottom: '8px', fontSize: '14px', color: '#ddd' }}>
                • Try switching between WiFi and mobile data
              </li>
              <li style={{ marginBottom: '8px', fontSize: '14px', color: '#ddd' }}>
                • Move closer to your router
              </li>
              <li style={{ fontSize: '14px', color: '#ddd' }}>
                • Restart your internet connection
              </li>
            </ul>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              background: '#E0AD6B',
              color: 'white',
              opacity: isRetrying ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isRetrying ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Checking...
              </>
            ) : (
              <>
                <i className="fas fa-redo"></i>
                Try Again
              </>
            )}
          </button>

          <button
            onClick={handleContinueAnyway}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #555',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'transparent',
              color: '#ccc'
            }}
          >
            <i className="fas fa-forward"></i>
            Continue
          </button>
        </div>

        <div style={{
          textAlign: 'center',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#999',
            margin: 0
          }}>
            <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
            The app automatically optimizes for your connection
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkModal;
