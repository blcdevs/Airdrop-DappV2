import React, { createContext, useContext, useState, useEffect } from 'react';

const NetworkContext = createContext();

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export const NetworkProvider = ({ children }) => {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
    isSlowConnection: false,
    connectionQuality: 'good' // poor, fair, good, excellent
  });

  const [retryAttempts, setRetryAttempts] = useState(0);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkHistory, setNetworkHistory] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Network quality thresholds
  const QUALITY_THRESHOLDS = {
    excellent: { rtt: 50, downlink: 10 },
    good: { rtt: 150, downlink: 1.5 },
    fair: { rtt: 300, downlink: 0.5 },
    poor: { rtt: 1000, downlink: 0.1 }
  };

  // Determine connection quality
  const getConnectionQuality = (rtt, downlink) => {
    if (rtt <= QUALITY_THRESHOLDS.excellent.rtt && downlink >= QUALITY_THRESHOLDS.excellent.downlink) {
      return 'excellent';
    } else if (rtt <= QUALITY_THRESHOLDS.good.rtt && downlink >= QUALITY_THRESHOLDS.good.downlink) {
      return 'good';
    } else if (rtt <= QUALITY_THRESHOLDS.fair.rtt && downlink >= QUALITY_THRESHOLDS.fair.downlink) {
      return 'fair';
    } else {
      return 'poor';
    }
  };

  // Update network information
  const updateNetworkInfo = () => {
    if (typeof window === 'undefined') return;

    try {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

      const newStatus = {
        isOnline: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false,
        isSlowConnection: false,
        connectionQuality: 'good'
      };

      // Determine if connection is slow
      if (connection) {
        newStatus.connectionQuality = getConnectionQuality(newStatus.rtt, newStatus.downlink);
        newStatus.isSlowConnection = ['poor', 'fair'].includes(newStatus.connectionQuality);
      }

      // Check for 2G or slow 3G
      if (newStatus.effectiveType === '2g' || newStatus.effectiveType === 'slow-2g') {
        newStatus.isSlowConnection = true;
        newStatus.connectionQuality = 'poor';
      }

      setNetworkStatus(prev => {
        // Only update if there's a meaningful change
        if (prev.isOnline !== newStatus.isOnline ||
            prev.connectionQuality !== newStatus.connectionQuality) {
          return newStatus;
        }
        return prev;
      });

      // Add to history for tracking (only if initialized)
      if (isInitialized) {
        setNetworkHistory(prev => {
          const newHistory = [...prev, { ...newStatus, timestamp: Date.now() }];
          return newHistory.slice(-10); // Keep last 10 readings
        });
      }

      // Show modal for poor connections (only if initialized and not already showing)
      if (isInitialized && newStatus.connectionQuality === 'poor' && newStatus.isOnline && !showNetworkModal) {
        setShowNetworkModal(true);
      }
    } catch (error) {
      console.warn('Network info update failed:', error);
    }
  };

  // Network-aware fetch with retries and timeouts
  const networkFetch = async (url, options = {}, customTimeout = null) => {
    const quality = networkStatus.connectionQuality;
    
    // Adjust timeout based on connection quality
    const timeouts = {
      excellent: 5000,
      good: 10000,
      fair: 20000,
      poor: 30000
    };

    const timeout = customTimeout || timeouts[quality] || 15000;
    const maxRetries = quality === 'poor' ? 5 : quality === 'fair' ? 3 : 2;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        setRetryAttempts(0);
        return response;

      } catch (error) {
        clearTimeout(timeoutId);
        
        if (attempt === maxRetries) {
          setRetryAttempts(attempt);
          throw new Error(`Network request failed after ${maxRetries} attempts: ${error.message}`);
        }

        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 1000, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        setRetryAttempts(attempt);
      }
    }
  };

  // Contract call wrapper with network awareness
  const networkContractCall = async (contractMethod, ...args) => {
    const quality = networkStatus.connectionQuality;
    const maxRetries = quality === 'poor' ? 5 : quality === 'fair' ? 3 : 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await contractMethod(...args);
        setRetryAttempts(0);
        return result;
      } catch (error) {
        if (attempt === maxRetries) {
          setRetryAttempts(attempt);
          throw error;
        }

        // Exponential backoff
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), 15000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        setRetryAttempts(attempt);
      }
    }
  };

  // Get network-appropriate settings
  const getNetworkSettings = () => {
    const quality = networkStatus.connectionQuality;
    
    return {
      batchSize: quality === 'poor' ? 1 : quality === 'fair' ? 3 : 5,
      requestDelay: quality === 'poor' ? 2000 : quality === 'fair' ? 1000 : 500,
      enableImageOptimization: ['poor', 'fair'].includes(quality),
      enableDataSaver: quality === 'poor',
      maxConcurrentRequests: quality === 'poor' ? 1 : quality === 'fair' ? 2 : 4
    };
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize after a short delay to prevent SSR issues
    const initTimer = setTimeout(() => {
      setIsInitialized(true);
      updateNetworkInfo();
    }, 100);

    // Listen for network changes
    const handleOnline = () => {
      if (isInitialized) {
        updateNetworkInfo();
        setShowNetworkModal(false);
      }
    };

    const handleOffline = () => {
      if (isInitialized) {
        setNetworkStatus(prev => ({ ...prev, isOnline: false }));
        setShowNetworkModal(true);
      }
    };

    const handleConnectionChange = () => {
      if (isInitialized) {
        // Debounce connection changes to prevent rapid updates
        clearTimeout(window.networkChangeTimeout);
        window.networkChangeTimeout = setTimeout(updateNetworkInfo, 1000);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Periodic network quality check (less frequent)
    const interval = setInterval(() => {
      if (isInitialized) {
        updateNetworkInfo();
      }
    }, 60000); // Check every 60 seconds instead of 30

    return () => {
      clearTimeout(initTimer);
      clearTimeout(window.networkChangeTimeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      clearInterval(interval);
    };
  }, [isInitialized]);

  const value = {
    networkStatus,
    retryAttempts,
    showNetworkModal,
    setShowNetworkModal,
    networkHistory,
    networkFetch,
    networkContractCall,
    getNetworkSettings,
    updateNetworkInfo
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};
