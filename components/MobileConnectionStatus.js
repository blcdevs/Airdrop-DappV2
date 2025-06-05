import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { isMobileBrowser, checkMobileConnection } from '../utils/mobileUtils';

const MobileConnectionStatus = () => {
  const { 
    isConnected, 
    provider, 
    isMobile, 
    mobileConnectionReady, 
    isInitializing,
    initError 
  } = useWeb3();
  
  const [showStatus, setShowStatus] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Only show for mobile browsers
    setShowStatus(isMobileBrowser());
  }, []);

  useEffect(() => {
    if (!showStatus || !isConnected) {
      setConnectionStatus('disconnected');
      return;
    }

    const checkConnection = async () => {
      if (isInitializing) {
        setConnectionStatus('connecting');
        return;
      }

      if (initError) {
        setConnectionStatus('error');
        return;
      }

      if (mobileConnectionReady) {
        setConnectionStatus('connected');
        return;
      }

      // Additional connection check for mobile
      if (provider) {
        try {
          const isOk = await checkMobileConnection(provider);
          setConnectionStatus(isOk ? 'connected' : 'error');
        } catch (error) {
          setConnectionStatus('error');
        }
      } else {
        setConnectionStatus('checking');
      }
    };

    checkConnection();
  }, [showStatus, isConnected, isInitializing, initError, mobileConnectionReady, provider]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setConnectionStatus('checking');
    
    // Trigger a page refresh as last resort
    if (retryCount >= 2) {
      window.location.reload();
    }
  };

  if (!showStatus) return null;

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          color: 'bg-green-500',
          text: 'Connected',
          icon: '✓',
          showRetry: false
        };
      case 'connecting':
      case 'checking':
        return {
          color: 'bg-yellow-500',
          text: 'Connecting...',
          icon: '⟳',
          showRetry: false
        };
      case 'error':
        return {
          color: 'bg-red-500',
          text: 'Connection Issue',
          icon: '⚠',
          showRetry: true
        };
      case 'disconnected':
      default:
        return {
          color: 'bg-gray-500',
          text: 'Disconnected',
          icon: '○',
          showRetry: false
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium
        ${statusConfig.color} shadow-lg backdrop-blur-sm bg-opacity-90
        transition-all duration-300 ease-in-out
      `}>
        <span className={`
          inline-block w-3 h-3 text-center leading-3 text-xs
          ${connectionStatus === 'connecting' || connectionStatus === 'checking' ? 'animate-spin' : ''}
        `}>
          {statusConfig.icon}
        </span>
        <span>{statusConfig.text}</span>
        
        {statusConfig.showRetry && (
          <button
            onClick={handleRetry}
            className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors"
          >
            {retryCount >= 2 ? 'Refresh' : 'Retry'}
          </button>
        )}
      </div>
      
      {connectionStatus === 'error' && (
        <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm max-w-xs">
          <p className="font-medium mb-1">Connection Problem</p>
          <p className="text-xs">
            Having trouble fetching data. This can happen on mobile browsers. 
            Try refreshing the page or switching to a dApp browser for better performance.
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileConnectionStatus;
