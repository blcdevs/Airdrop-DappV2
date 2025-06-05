import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const OfflineNotification = () => {
  const { isOnline, showOfflineMessage, hideOfflineMessage } = useNetworkStatus();

  if (!showOfflineMessage || isOnline) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        border: '1px solid #333',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          📵
        </div>
        
        <h2 style={{
          color: '#fff',
          fontSize: '24px',
          fontWeight: '600',
          margin: '0 0 12px 0'
        }}>
          No Internet Connection
        </h2>
        
        <p style={{
          color: '#ccc',
          fontSize: '16px',
          margin: '0 0 24px 0',
          lineHeight: '1.5'
        }}>
          Please check your internet connection and try again.
        </p>

        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            color: '#ef4444',
            fontSize: '14px',
            fontWeight: '600',
            margin: '0 0 8px 0'
          }}>
            Quick Fixes:
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            textAlign: 'left',
            color: '#ccc',
            fontSize: '14px'
          }}>
            <li style={{ marginBottom: '4px' }}>• Check your WiFi or mobile data</li>
            <li style={{ marginBottom: '4px' }}>• Try switching networks</li>
            <li style={{ marginBottom: '4px' }}>• Move closer to your router</li>
            <li>• Restart your connection</li>
          </ul>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#E0AD6B',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          <i className="fas fa-redo" style={{ marginRight: '8px' }}></i>
          Refresh Page
        </button>

        <button
          onClick={hideOfflineMessage}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'transparent',
            color: '#ccc',
            border: '1px solid #555',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Continue Offline
        </button>
      </div>
    </div>
  );
};

export default OfflineNotification;
