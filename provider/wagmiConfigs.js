import { createConfig, http } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { 
    rainbowWallet,
    metaMaskWallet,
    trustWallet,
    walletConnectWallet,
    coinbaseWallet,
    argentWallet,
    ledgerWallet,
    safeWallet,
    braveWallet,
    imTokenWallet,
    injectedWallet,
    omniWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';

const projectId = 'c87b9758c721b75cf076ef3cc19ddd58'; // Get from https://cloud.walletconnect.com/

// Enhanced mobile detection with iOS specific detection
const getDeviceInfo = () => {
  if (typeof navigator === 'undefined') return { isMobile: false, isIOS: false, isAndroid: false };
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone|opera mini|silk/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isAndroid = /android/i.test(userAgent);
  
  return { isMobile, isIOS, isAndroid, userAgent };
};

const { isMobile, isIOS, isAndroid, userAgent } = getDeviceInfo();

// Improved WalletConnect configuration with better mobile support
const walletConnectConfig = {
  projectId,
  metadata: {
    name: 'Tinseltoken',
    description: 'Tinseltoken Airdrop Platform',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    icons: ['https://thetinseltoken.com/assets/images/logo.png']
  },
  showQrModal: true,
  qrModalOptions: {
    themeMode: "dark",
    desktopWallets: !isMobile,
    mobileWallets: isMobile,
    explorerRecommendedWalletIds: isIOS 
      ? ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
         '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust
         '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369'] // Rainbow
      : ['5195e9db3e7eddfa8e6d94e428d348456fed2f6f5839423f4e152bac877ac9a2', // MetaMask Android
         '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'] // Trust Android
  },
  enableInjected: true, // Allow injected providers on mobile
  enableMobileLinks: true // Enable proper deep links on mobile
};

// Enhanced deep linking with better iOS support
const openWalletApp = (uri, name) => {
  if (!isMobile || typeof window === 'undefined') return false;

  try {
    // Encode the WalletConnect URI
    const encoded = encodeURIComponent(uri);
    
    // iOS specific handling
    if (isIOS) {
      // iOS universal links and custom URL schemes
      if (name === 'Trust Wallet') {
        // Try universal link first, then fallback to custom scheme
        window.location.href = `trust://wc?uri=${encoded}`;
        
        // Set a timeout to try the alternative URI if the first one fails
        setTimeout(() => {
          window.location.href = `https://link.trustwallet.com/wc?uri=${encoded}`;
        }, 500);
        return true;
      } else if (name === 'MetaMask') {
        window.location.href = `metamask://wc?uri=${encoded}`;
        setTimeout(() => {
          window.location.href = `https://metamask.app.link/wc?uri=${encoded}`;
        }, 500);
        return true;
      } else if (name === 'Rainbow') {
        window.location.href = `rainbow://wc?uri=${encoded}`;
        return true;
      } else if (name === 'Coinbase Wallet') {
        window.location.href = `cbwallet://wc?uri=${encoded}`;
        setTimeout(() => {
          window.location.href = `https://wallet.coinbase.com/wc?uri=${encoded}`;
        }, 500);
        return true;
      }
      
      // Fallback for iOS
      window.location.href = `wc://?uri=${uri}`;
      return true;
    }
    
    // Android specific handling
    if (isAndroid) {
      if (name === 'Trust Wallet') {
        window.location.href = `https://link.trustwallet.com/wc?uri=${encoded}`;
        return true;
      } else if (name === 'MetaMask') {
        window.location.href = `https://metamask.app.link/wc?uri=${encoded}`;
        return true;
      } else if (name === 'Coinbase Wallet') {
        window.location.href = `https://wallet.coinbase.com/wc?uri=${encoded}`;
        return true;
      }
      
      // Default to WalletConnect protocol for Android
      window.location.href = `wc:${uri}`;
      return true;
    }
    
    // Generic fallback
    window.location.href = `wc:${uri}`;
    return true;
  } catch (error) {
    console.error('Error opening wallet app:', error);
    return false;
  }
};

// Enhanced mobile wallet config with better error handling
const mobileWalletConfig = {
  enableMobileWalletConnect: true,
  handleUri: (uri) => {
    if (typeof window !== 'undefined') {
      // For injected providers, try to handle chain switching with better error handling
      if (window.ethereum) {
        try {
          window.ethereum.request({ 
            method: 'wallet_addEthereumChain', 
            params: [{
              chainId: `0x${bsc.id.toString(16)}`,
              chainName: bsc.name,
              nativeCurrency: bsc.nativeCurrency,
              rpcUrls: [bsc.rpcUrls.default.http[0]],
              blockExplorerUrls: [bsc.blockExplorers.default.url],
            }]
          }).catch(err => {
            console.log('Chain add error:', err);
            // Continue with URI handling even if chain switching fails
          });
        } catch (err) {
          console.log('Ethereum provider error:', err);
          // Continue with URI handling
        }
      }
      
      // Enhanced wallet detection logic
      if (isIOS) {
        // Prioritize detection order for iOS
        if (userAgent.includes('crios') || userAgent.includes('firefox')) {
          // Chrome or Firefox on iOS - try Trust Wallet first
          return openWalletApp(uri, 'Trust Wallet');
        } else if (userAgent.includes('safari')) {
          // Safari on iOS - try MetaMask first
          return openWalletApp(uri, 'MetaMask');
        } else {
          // Generic iOS - try both popular options
          return openWalletApp(uri, 'MetaMask') || openWalletApp(uri, 'Trust Wallet');
        }
      } else if (isAndroid) {
        // Android detection logic
        if (userAgent.includes('trust')) {
          return openWalletApp(uri, 'Trust Wallet');
        } else if (userAgent.includes('metamask')) {
          return openWalletApp(uri, 'MetaMask');
        } else {
          // Generic Android - try MetaMask first then Trust
          return openWalletApp(uri, 'MetaMask') || openWalletApp(uri, 'Trust Wallet');
        }
      }
      
      // Last resort for mobile
      if (isMobile) {
        return openWalletApp(uri, isIOS ? 'MetaMask' : 'Trust Wallet');
      }
    }
    return false;
  }
};

// Optimized wallet order based on device type
const getMobileOptimizedWallets = () => {
  if (isIOS) {
    // iOS optimized order
    return [
      metaMaskWallet,
      trustWallet,
      rainbowWallet,
      walletConnectWallet,
      coinbaseWallet
    ];
  } else if (isAndroid) {
    // Android optimized order
    return [
      metaMaskWallet,
      trustWallet,
      walletConnectWallet,
      coinbaseWallet,
      rainbowWallet
    ];
  } else {
    // Default desktop order
    return [
      metaMaskWallet,
      trustWallet,
      walletConnectWallet,
      rainbowWallet
    ];
  }
};

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: getMobileOptimizedWallets(),
    },
    {
      groupName: 'Other',
      wallets: [
        argentWallet,
        ledgerWallet,
        safeWallet,
        braveWallet,
        imTokenWallet,
        injectedWallet,
        omniWallet,
      ],
    },
  ],
  {
    projectId,
    appName: 'Tinseltoken',
    chains: [bsc],
    initialChain: bsc.id,
    walletConnectOptions: walletConnectConfig,
    ...mobileWalletConfig
  }
);

// Enhanced session management and deep link handling
if (typeof window !== 'undefined') {
  // Clean up stale WalletConnect sessions on page load
  window.addEventListener('load', () => {
    // Handle Trust Wallet deep links
    if (window.location.href.includes('wc?uri=')) {
      const uri = decodeURIComponent(window.location.href.split('wc?uri=')[1]);
      if (isIOS) {
        window.location.href = `trust://wc?uri=${uri}`;
      } else {
        window.location.href = `https://link.trustwallet.com/wc?uri=${uri}`;
      }
    }
    
    // Improved WalletConnect session management
    const clearStaleSession = () => {
      try {
        // Check for WalletConnect v2 session
        const wcSessionKey = Object.keys(localStorage).find(key => 
          key.startsWith('wc@2:') || key === 'walletconnect'
        );
        
        if (wcSessionKey) {
          const session = JSON.parse(localStorage.getItem(wcSessionKey));
          if (session && (!session.connected || Date.now() > session.expiry)) {
            localStorage.removeItem(wcSessionKey);
            console.log('Removed stale WalletConnect session');
          }
        }
      } catch (e) {
        console.log('Error managing WalletConnect session:', e);
        // Clean all potential wallet sessions to avoid issues
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('wc@') || key === 'walletconnect') {
            localStorage.removeItem(key);
          }
        });
      }
    };
    
    clearStaleSession();
    
    // Add visibilitychange event to handle app switching on mobile
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isMobile) {
        // When returning to the app, check if we need to refresh the connection
        setTimeout(() => {
          if (window.ethereum && window.ethereum.isConnected && !window.ethereum.isConnected()) {
            console.log('Connection lost during app switch, refreshing...');
            window.location.reload();
          }
        }, 1000);
      }
    });
  });
}

export const config = createConfig({
  connectors,
  chains: [bsc],
  transports: {
    [bsc.id]: http(),
  },
});