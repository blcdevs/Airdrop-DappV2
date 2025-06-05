/**
 * Mobile browser detection and enhanced data fetching utilities
 */

// Detect if user is on mobile device
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Check for mobile user agents
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(userAgent);
  
  // Check for touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check screen size
  const isSmallScreen = window.innerWidth <= 768;
  
  return isMobileUA || (isTouchDevice && isSmallScreen);
};

// Detect if user is using a mobile browser (not dApp browser)
export const isMobileBrowser = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check if it's a mobile device first
  if (!isMobileDevice()) return false;
  
  // Check if it's NOT a dApp browser
  const dAppBrowsers = [
    'trust', 'metamask', 'coinbase', 'binance', 'tokenpocket',
    'imtoken', 'mathwallet', 'safepal', 'bitkeep', 'okx'
  ];
  
  const isDAppBrowser = dAppBrowsers.some(browser => userAgent.includes(browser));
  
  // Return true if mobile but not dApp browser
  return !isDAppBrowser;
};

// Enhanced retry mechanism for mobile browsers
export const retryWithBackoff = async (fn, maxRetries = 5, baseDelay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
      
      console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`, error);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Enhanced contract call for mobile browsers
export const enhancedContractCall = async (contract, methodName, params = [], options = {}) => {
  if (!contract || !methodName) {
    throw new Error('Contract and method name are required');
  }
  
  const isMobile = isMobileBrowser();
  const maxRetries = isMobile ? 5 : 3;
  const baseDelay = isMobile ? 2000 : 1000;
  
  return retryWithBackoff(async () => {
    try {
      // Add mobile-specific options
      const callOptions = {
        ...options,
        // Increase gas limit for mobile
        ...(isMobile && { gasLimit: options.gasLimit ? options.gasLimit * 1.2 : undefined })
      };
      
      // Call the contract method
      if (params.length > 0) {
        return await contract[methodName](...params, callOptions);
      } else {
        return await contract[methodName](callOptions);
      }
    } catch (error) {
      console.error(`Contract call ${methodName} failed:`, error);
      
      // Add mobile-specific error handling
      if (isMobile && error.message?.includes('network')) {
        // Wait a bit longer on mobile for network issues
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      throw error;
    }
  }, maxRetries, baseDelay);
};

// Enhanced data fetching with mobile optimizations
export const enhancedDataFetch = async (fetchFunction, fallbackFunction = null) => {
  const isMobile = isMobileBrowser();
  
  try {
    // Primary fetch attempt
    const result = await retryWithBackoff(fetchFunction, isMobile ? 5 : 3, isMobile ? 2000 : 1000);
    return result;
  } catch (error) {
    console.error('Primary fetch failed:', error);
    
    // Try fallback if available
    if (fallbackFunction) {
      try {
        console.log('Trying fallback fetch method...');
        const fallbackResult = await retryWithBackoff(fallbackFunction, 3, 2000);
        return fallbackResult;
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    }
    
    throw error;
  }
};

// Mobile-specific connection check
export const checkMobileConnection = async (provider) => {
  if (!provider || !isMobileBrowser()) return true;
  
  try {
    // Test basic connectivity
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    console.log('Mobile connection check passed:', { network: network.chainId, blockNumber });
    return true;
  } catch (error) {
    console.error('Mobile connection check failed:', error);
    return false;
  }
};

// Wait for mobile wallet to be ready
export const waitForMobileWallet = async (maxWait = 10000) => {
  if (!isMobileBrowser()) return true;
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    try {
      if (window.ethereum && window.ethereum.isConnected && window.ethereum.isConnected()) {
        // Additional check for mobile
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          console.log('Mobile wallet ready');
          return true;
        }
      }
    } catch (error) {
      // Continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.warn('Mobile wallet readiness timeout');
  return false;
};

// Enhanced error handling for mobile
export const handleMobileError = (error, context = '') => {
  const isMobile = isMobileBrowser();
  
  if (!isMobile) return error;
  
  // Mobile-specific error messages
  const mobileErrorMessages = {
    'network changed': 'Please ensure you\'re connected to the correct network in your wallet app.',
    'user rejected': 'Transaction was cancelled. Please try again.',
    'insufficient funds': 'Insufficient funds for transaction. Please check your wallet balance.',
    'timeout': 'Request timed out. Please check your internet connection and try again.',
    'connection': 'Connection issue detected. Please refresh the page and reconnect your wallet.'
  };
  
  const errorMessage = error.message?.toLowerCase() || '';
  
  for (const [key, message] of Object.entries(mobileErrorMessages)) {
    if (errorMessage.includes(key)) {
      return new Error(`${context ? context + ': ' : ''}${message}`);
    }
  }
  
  return error;
};

// Mobile performance optimization
export const optimizeForMobile = () => {
  if (!isMobileBrowser()) return;
  
  // Reduce animation frequency on mobile
  if (typeof window !== 'undefined') {
    // Throttle resize events
    let resizeTimeout;
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
      if (type === 'resize') {
        const throttledListener = function(event) {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => listener(event), 250);
        };
        return originalAddEventListener.call(this, type, throttledListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
};

export default {
  isMobileDevice,
  isMobileBrowser,
  retryWithBackoff,
  enhancedContractCall,
  enhancedDataFetch,
  checkMobileConnection,
  waitForMobileWallet,
  handleMobileError,
  optimizeForMobile
};
