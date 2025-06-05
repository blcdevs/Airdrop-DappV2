import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { isMobileBrowser, enhancedDataFetch, handleMobileError } from '../utils/mobileUtils';

/**
 * Enhanced data fetching hook for mobile browsers
 * Provides retry logic, error handling, and loading states optimized for mobile
 */
export const useMobileEnhancedData = (fetchFunction, dependencies = [], options = {}) => {
  const {
    retryAttempts = 3,
    retryDelay = 2000,
    autoRefresh = false,
    refreshInterval = 30000,
    fallbackValue = null
  } = options;

  const { contract, isConnected, isMobile, mobileConnectionReady } = useWeb3();
  const [data, setData] = useState(fallbackValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const isMobileBrowser_ = isMobileBrowser();

  const fetchData = useCallback(async (isRetry = false) => {
    if (!contract || !isConnected) {
      setData(fallbackValue);
      return;
    }

    // Wait for mobile connection to be ready
    if (isMobileBrowser_ && !mobileConnectionReady) {
      return;
    }

    if (!isRetry) {
      setLoading(true);
      setError(null);
    }

    try {
      let result;
      
      if (isMobileBrowser_) {
        // Use enhanced data fetch for mobile browsers
        result = await enhancedDataFetch(fetchFunction);
      } else {
        // Standard fetch for desktop
        result = await fetchFunction();
      }

      setData(result);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      const handledError = handleMobileError(err, 'Data fetch');
      console.error('Data fetch failed:', handledError);
      setError(handledError);

      // Retry logic for mobile browsers
      if (isMobileBrowser_ && retryCount < retryAttempts) {
        const delay = retryDelay * Math.pow(2, retryCount); // Exponential backoff
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData(true);
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [contract, isConnected, mobileConnectionReady, fetchFunction, retryCount, retryAttempts, retryDelay, fallbackValue, isMobileBrowser_]);

  // Manual retry function
  const retry = useCallback(() => {
    setRetryCount(0);
    fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Auto refresh for mobile browsers
  useEffect(() => {
    if (!autoRefresh || !isMobileBrowser_) return;

    const interval = setInterval(() => {
      if (!loading && !error) {
        fetchData(true); // Silent refresh
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, error, fetchData, isMobileBrowser_]);

  return {
    data,
    loading,
    error,
    retry,
    retryCount,
    isMobile: isMobileBrowser_
  };
};

/**
 * Hook for fetching user points with mobile optimization
 */
export const useMobileUserPoints = (userAddress) => {
  const { getPoints } = useWeb3();
  
  const fetchUserPoints = useCallback(async () => {
    if (!getPoints) throw new Error('getPoints function not available');
    return await getPoints(userAddress);
  }, [getPoints, userAddress]);

  return useMobileEnhancedData(fetchUserPoints, [userAddress], {
    retryAttempts: 5,
    retryDelay: 2000,
    autoRefresh: true,
    refreshInterval: 30000,
    fallbackValue: { toString: () => '0' }
  });
};

/**
 * Hook for fetching tasks with mobile optimization
 */
export const useMobileTasks = () => {
  const { getAllTasks } = useWeb3();
  
  const fetchTasks = useCallback(async () => {
    if (!getAllTasks) throw new Error('getAllTasks function not available');
    return await getAllTasks();
  }, [getAllTasks]);

  return useMobileEnhancedData(fetchTasks, [], {
    retryAttempts: 5,
    retryDelay: 3000,
    autoRefresh: false,
    fallbackValue: []
  });
};

/**
 * Hook for fetching referral info with mobile optimization
 */
export const useMobileReferralInfo = (userAddress) => {
  const { getUserReferralInfo } = useWeb3();
  
  const fetchReferralInfo = useCallback(async () => {
    if (!getUserReferralInfo) throw new Error('getUserReferralInfo function not available');
    return await getUserReferralInfo(userAddress);
  }, [getUserReferralInfo, userAddress]);

  return useMobileEnhancedData(fetchReferralInfo, [userAddress], {
    retryAttempts: 3,
    retryDelay: 2000,
    autoRefresh: true,
    refreshInterval: 60000,
    fallbackValue: { referralCount: 0, referrer: '0x0000000000000000000000000000000000000000' }
  });
};

/**
 * Hook for fetching airdrop info with mobile optimization
 */
export const useMobileAirdropInfo = () => {
  const { contract } = useWeb3();
  
  const fetchAirdropInfo = useCallback(async () => {
    if (!contract) throw new Error('Contract not available');
    return await contract.getAirdropInfo();
  }, [contract]);

  return useMobileEnhancedData(fetchAirdropInfo, [], {
    retryAttempts: 5,
    retryDelay: 3000,
    autoRefresh: true,
    refreshInterval: 60000,
    fallbackValue: null
  });
};

export default useMobileEnhancedData;
