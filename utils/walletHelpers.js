/**
 * Utility functions to help with wallet connections, particularly on mobile devices
 */

/**
 * Detect device type and browser environment
 * @returns {Object} Device information
 */
export const getDeviceInfo = () => {
  if (typeof navigator === 'undefined') {
    return { isMobile: false, isIOS: false, isAndroid: false, isSafari: false, isChrome: false };
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone|opera mini|silk/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isAndroid = /android/i.test(userAgent);
  const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent);
  const isChrome = /chrome|crios/i.test(userAgent);
  
  return { 
    isMobile, 
    isIOS, 
    isAndroid, 
    isSafari, 
    isChrome,
    userAgent 
  };
};

/**
 * Opens a wallet app with the given URI on a mobile device
 * @param {string} uri - WalletConnect URI
 * @param {string} walletName - Name of the wallet to open
 * @returns {boolean} Whether a wallet app was opened
 */
export const openWalletApp = (uri, walletName) => {
  const { isMobile, isIOS, isAndroid } = getDeviceInfo();
  if (!isMobile || typeof window === 'undefined' || !uri) return false;
  
  try {
    // Encode the WalletConnect URI
    const encoded = encodeURIComponent(uri);
    let opened = false;
    
    // iOS specific handling
    if (isIOS) {
      switch (walletName.toLowerCase()) {
        case 'metamask':
          window.location.href = `metamask://wc?uri=${encoded}`;
          setTimeout(() => {
            if (!opened) window.location.href = `https://metamask.app.link/wc?uri=${encoded}`;
          }, 500);
          return true;
          
        case 'trust':
        case 'trust wallet':
          window.location.href = `trust://wc?uri=${encoded}`;
          setTimeout(() => {
            if (!opened) window.location.href = `https://link.trustwallet.com/wc?uri=${encoded}`;
          }, 500);
          return true;
          
        case 'rainbow':
          window.location.href = `rainbow://wc?uri=${encoded}`;
          return true;
          
        case 'coinbase':
        case 'coinbase wallet':
          window.location.href = `cbwallet://wc?uri=${encoded}`;
          setTimeout(() => {
            if (!opened) window.location.href = `https://wallet.coinbase.com/wc?uri=${encoded}`;
          }, 500);
          return true;
          
        default:
          // Generic fallback for iOS
          window.location.href = `wc://?uri=${uri}`;
          return true;
      }
    }
    
    // Android specific handling
    if (isAndroid) {
      switch (walletName.toLowerCase()) {
        case 'metamask':
          window.location.href = `https://metamask.app.link/wc?uri=${encoded}`;
          return true;
          
        case 'trust':
        case 'trust wallet':
          window.location.href = `https://link.trustwallet.com/wc?uri=${encoded}`;
          return true;
          
        case 'coinbase':
        case 'coinbase wallet':
          window.location.href = `https://wallet.coinbase.com/wc?uri=${encoded}`;
          return true;
          
        default:
          // Generic fallback for Android
          window.location.href = `wc:${uri}`;
          return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error opening wallet app:', error);
    return false;
  }
};

/**
 * Get token deep link for a specific wallet
 * @param {Object} tokenInfo - Token information
 * @param {string} wallet - Wallet name
 * @returns {string} Deep link URL
 */
export const getTokenDeepLink = (tokenInfo, wallet) => {
  const { isIOS, isAndroid } = getDeviceInfo();
  const { address, symbol, decimals, image } = tokenInfo;
  
  if (!address) return null;
  
  const encodedAddress = encodeURIComponent(address);
  const encodedSymbol = encodeURIComponent(symbol || '');
  const encodedImage = encodeURIComponent(image || '');
  
  switch (wallet.toLowerCase()) {
    case 'metamask':
      if (isIOS) {
        return `metamask://add-token?address=${encodedAddress}&symbol=${encodedSymbol}&decimals=${decimals || 18}`;
      } else {
        return `https://metamask.app.link/add-token?address=${encodedAddress}&symbol=${encodedSymbol}&decimals=${decimals || 18}`;
      }
      
    case 'trust':
    case 'trustwallet':
      if (isIOS) {
        return `trust://add_token?address=${encodedAddress}&symbol=${encodedSymbol}&decimals=${decimals || 18}&image=${encodedImage}`;
      } else if (isAndroid) {
        // For BSC chain
        return `https://link.trustwallet.com/add_token?asset=c20000714_t${address}`;
      }
      return null;
      
    case 'coinbase':
      if (isIOS) {
        return `coinbasewallet://add-token?address=${encodedAddress}&symbol=${encodedSymbol}&decimals=${decimals || 18}`;
      } else {
        return `https://wallet.coinbase.com/add-token?address=${encodedAddress}&symbol=${encodedSymbol}&decimals=${decimals || 18}&chain=BSC`;
      }
      
    case 'rainbow':
      if (isIOS) {
        return `rainbow://add-token?address=${encodedAddress}&symbol=${encodedSymbol}&decimals=${decimals || 18}`;
      }
      return null;
      
    default:
      return null;
  }
};

/**
 * Opens multiple wallet apps in sequence with small delays
 * (Helps on iOS where only one deep link can be triggered at a time)
 * @param {Object} tokenInfo - Token information
 */
export const openTokenInMultipleWallets = (tokenInfo) => {
  const { isIOS, isAndroid } = getDeviceInfo();
  
  if (isIOS) {
    const delay = 300;
    
    // Try MetaMask first
    const metamaskLink = getTokenDeepLink(tokenInfo, 'metamask');
    if (metamaskLink) {
      window.location.href = metamaskLink;
    }
    
    // Then try Trust Wallet after a delay
    setTimeout(() => {
      const trustLink = getTokenDeepLink(tokenInfo, 'trust');
      if (trustLink) {
        // Use iframe trick for second wallet
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.src = trustLink;
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 500);
      }
    }, delay);
  } else if (isAndroid) {
    // On Android try direct deep link
    const trustLink = getTokenDeepLink(tokenInfo, 'trust');
    if (trustLink) {
      window.location.href = trustLink;
    }
  }
};

/**
 * Try known wallet deep links in sequence for best compatibility
 * @param {string} uri - WalletConnect URI
 * @returns {boolean} Whether a wallet app was attempted to be opened
 */
export const tryAllWalletLinks = (uri) => {
  const { isIOS } = getDeviceInfo();
  
  if (isIOS) {
    // Order of preference for iOS
    return (
      openWalletApp(uri, 'MetaMask') || 
      openWalletApp(uri, 'Trust Wallet') ||
      openWalletApp(uri, 'Rainbow') ||
      openWalletApp(uri, 'Coinbase Wallet')
    );
  } else {
    // Order of preference for Android
    return (
      openWalletApp(uri, 'MetaMask') || 
      openWalletApp(uri, 'Trust Wallet') ||
      openWalletApp(uri, 'Coinbase Wallet')
    );
  }
};

/**
 * Check if a wallet is installed
 * @returns {Object} Information about installed wallets
 */
export const checkWalletInstallation = () => {
  if (typeof window === 'undefined') {
    return { hasInjectedProvider: false, isMetaMask: false, isTrust: false, isCoinbase: false };
  }
  
  const ethereum = window.ethereum;
  
  return {
    hasInjectedProvider: !!ethereum,
    isMetaMask: !!ethereum?.isMetaMask,
    isTrust: !!ethereum?.isTrust,
    isCoinbase: !!ethereum?.isCoinbaseWallet
  };
};

/**
 * Get download links for popular wallets based on device type
 * @returns {Object} Download links
 */
export const getWalletDownloadLinks = () => {
  const { isIOS, isAndroid } = getDeviceInfo();
  
  if (isIOS) {
    return {
      metamask: 'https://apps.apple.com/app/metamask/id1438144202',
      trust: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
      coinbase: 'https://apps.apple.com/app/coinbase-wallet-nfts-crypto/id1278383455',
      rainbow: 'https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021'
    };
  } else if (isAndroid) {
    return {
      metamask: 'https://play.google.com/store/apps/details?id=io.metamask',
      trust: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
      coinbase: 'https://play.google.com/store/apps/details?id=org.toshi',
      rainbow: 'https://play.google.com/store/apps/details?id=me.rainbow'
    };
  }
  
  return {};
};

/**
 * Handle visibility change to detect app switching
 * @param {Function} onReturn - Callback when user returns to the app
 * @returns {Function} Function to remove the event listener
 */
export const handleAppVisibilityChange = (onReturn) => {
  if (typeof document === 'undefined') return () => {};

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      if (typeof onReturn === 'function') {
        setTimeout(onReturn, 1000);
      }
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

/**
 * Clean up any stale wallet connection sessions
 */
export const cleanupWalletSessions = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  
  try {
    // Find all WalletConnect related items
    const wcKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('wc@') || key === 'walletconnect' || key.includes('wagmi'))) {
        wcKeys.push(key);
      }
    }
    
    // Check each key and remove if stale
    wcKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        // If session is expired or disconnected, remove it
        if (data && (!data.connected || (data.expiry && Date.now() > data.expiry))) {
          localStorage.removeItem(key);
          console.log(`Removed stale session: ${key}`);
        }
      } catch (e) {
        // If we can't parse it, it's probably corrupted - remove it
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error cleaning up wallet sessions:', error);
  }
}; 