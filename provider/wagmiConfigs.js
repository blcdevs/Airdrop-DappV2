import { createConfig, http, createStorage } from 'wagmi';
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

// Check for server-side rendering
const isServer = typeof window === 'undefined';

// Check if we're in a mobile environment (safe for SSR)
const isMobile = !isServer ? 
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : 
  false;
  
// Helper functions for device detection (safe for SSR)
const isIOS = !isServer ? /iPhone|iPad|iPod/i.test(navigator.userAgent) : false;
const isAndroid = !isServer ? /Android/i.test(navigator.userAgent) : false;

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
    mobileWallets: isMobile
  }
};

// Custom deep linking for mobile wallets
const openWalletApp = (uri, name) => {
  if (!isMobile || typeof window === 'undefined') return false;

  try {
    // Encode the WalletConnect URI
    const encoded = encodeURIComponent(uri);
    
    // Detect OS
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    
    // Wallet-specific deep links
    if (name === 'Trust Wallet') {
      window.location.href = `https://link.trustwallet.com/wc?uri=${encoded}`;
      return true;
    } else if (name === 'MetaMask') {
      window.location.href = isAndroid ? 
        `https://metamask.app.link/wc?uri=${encoded}` : 
        `metamask://wc?uri=${encoded}`;
      return true;
    } else if (name === 'Rainbow') {
      window.location.href = `rainbow://wc?uri=${encoded}`;
      return true;
    } else if (name === 'Coinbase Wallet') {
      window.location.href = `https://wallet.coinbase.com/wc?uri=${encoded}`;
      return true;
    }
    
    // Default to WalletConnect protocol
    window.location.href = `wc:${uri}`;
    return true;
  } catch (error) {
    console.error('Error opening wallet app:', error);
    return false;
  }
};

// Enhanced wallet connect options for mobile
const mobileWalletConfig = {
  enableMobileWalletConnect: true,
  handleUri: (uri) => {
    if (typeof window !== 'undefined') {
      // For injected providers, try to handle chain switching
      if (window.ethereum) {
        window.ethereum.request({ 
          method: 'wallet_addEthereumChain', 
          params: [{
            chainId: `0x${bsc.id.toString(16)}`,
            chainName: bsc.name,
            nativeCurrency: bsc.nativeCurrency,
            rpcUrls: [bsc.rpcUrls.default.http[0]],
            blockExplorerUrls: [bsc.blockExplorers.default.url],
          }]
        }).catch(err => console.log('Chain add error:', err));
      }
      
      // Try wallet-specific deep links based on detected browsers
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (userAgent.includes('trust')) {
        return openWalletApp(uri, 'Trust Wallet');
      } else if (userAgent.includes('metamask')) {
        return openWalletApp(uri, 'MetaMask');
      } else if (userAgent.includes('coinbase')) {
        return openWalletApp(uri, 'Coinbase Wallet');
      } else if (userAgent.includes('rainbow')) {
        return openWalletApp(uri, 'Rainbow');
      }
      
      // Generic mobile detection - prefer Trust Wallet on mobile
      if (isMobile) {
        return openWalletApp(uri, 'Trust Wallet');
      }
    }
    return false;
  }
};

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Mobile Friendly',
      wallets: [
        // Change the order for mobile to prioritize better mobile options
        isMobile ? 
          [trustWallet, walletConnectWallet, metaMaskWallet, rainbowWallet] :
          [metaMaskWallet, trustWallet, walletConnectWallet, rainbowWallet],
      ].flat(),
    },
    {
      groupName: 'Other',
      wallets: [
        coinbaseWallet,
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
    mobileWalletConfig
  }
);

// Create safe storage that prevents refresh loops
const createSafeStorage = () => {
  if (typeof window === 'undefined') return undefined;

  return createStorage({
    storage: {
      getItem: (key) => {
        try {
          // Skip problematic keys that cause refresh loops
          if (key.includes('walletconnect') || key.includes('removeReason')) {
            return null;
          }
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          // Skip problematic keys that cause refresh loops
          if (key.includes('walletconnect') || key.includes('removeReason')) {
            return;
          }
          localStorage.setItem(key, value);
        } catch {
          // Silently fail
        }
      },
      removeItem: (key) => {
        try {
          // Skip problematic keys that cause refresh loops
          if (key.includes('walletconnect') || key.includes('removeReason')) {
            return;
          }
          localStorage.removeItem(key);
        } catch {
          // Silently fail
        }
      },
    },
  });
};

export const config = createConfig({
  connectors,
  chains: [bsc],
  transports: {
    [bsc.id]: http(),
  },
  storage: createSafeStorage(),
  ssr: true, // Enable SSR support
});