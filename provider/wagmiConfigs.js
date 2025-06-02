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
    mobileWallets: isMobile,
    explorerRecommendedWalletIds: isMobile ? 
      ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
       '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust
       'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18'] : // Rainbow
      undefined,
    enableExplorer: true
  }
};

// Custom deep linking for mobile wallets with iOS focus
const openWalletApp = (uri, name) => {
  // Early return for server-side rendering
  if (isServer || !isMobile) return false;

  try {
    // Encode the WalletConnect URI
    const encoded = encodeURIComponent(uri);
    
    // Use the pre-defined variables that are safe for SSR
    // isIOS and isAndroid are already defined earlier
    
    // iOS-specific handling
    if (isIOS) {
      // Create a temporary anchor to open the app
      const openLink = (url) => {
        const a = document.createElement('a');
        a.href = url;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          // Fallback to universal links if deep linking fails
          if (name === 'Trust Wallet') {
            window.location.href = `https://link.trustwallet.com/wc?uri=${encoded}`;
          } else if (name === 'MetaMask') {
            window.location.href = `https://metamask.app.link/wc?uri=${encoded}`;
          }
        }, 300);
      };
      
      // Wallet-specific iOS deep links
      if (name === 'Trust Wallet') {
        openLink(`trust://wc?uri=${encoded}`);
        return true;
      } else if (name === 'MetaMask') {
        openLink(`metamask://wc?uri=${encoded}`);
        return true;
      } else if (name === 'Rainbow') {
        openLink(`rainbow://wc?uri=${encoded}`);
        return true;
      } else if (name === 'Coinbase Wallet') {
        openLink(`cbwallet://wc?uri=${encoded}`);
        return true;
      }
      
      // Generic WalletConnect for other wallets
      openLink(`wc://${uri}`);
      return true;
    }
    
    // Android handling
    if (name === 'Trust Wallet') {
      window.location.href = `https://link.trustwallet.com/wc?uri=${encoded}`;
      return true;
    } else if (name === 'MetaMask') {
      window.location.href = `https://metamask.app.link/wc?uri=${encoded}`;
      return true;
    } else if (name === 'Rainbow') {
      window.location.href = `https://rnbwapp.com/wc?uri=${encoded}`;
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

// Enhanced wallet connect options for mobile with improved iOS support
const mobileWalletConfig = {
  enableMobileWalletConnect: true,
  handleUri: (uri) => {
    // Early return for server-side rendering
    if (isServer) return false;
    
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
    
    // iOS-specific wallet prioritization
    if (isIOS) {
      // On iOS, try the most popular iOS wallets in order of compatibility
      const wallets = ['Trust Wallet', 'MetaMask', 'Rainbow', 'Coinbase Wallet'];
      
      // Try each wallet in sequence
      for (const wallet of wallets) {
        const success = openWalletApp(uri, wallet);
        if (success) return true;
      }
    }
    
    // Try wallet-specific deep links based on detected browsers for non-iOS
    if (!isServer) {
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
    }
    
    // Generic mobile detection - prefer Trust Wallet on mobile
    if (isMobile) {
      return openWalletApp(uri, 'Trust Wallet');
    }
    
    return false;
  }
};

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Mobile Friendly',
      wallets: [
        // Use a safer approach for SSR
        isServer ? 
          // Default order for server rendering
          [metaMaskWallet, trustWallet, walletConnectWallet, rainbowWallet] :
        // iOS-specific wallet order when in browser
        isIOS ?
          [trustWallet, metaMaskWallet, rainbowWallet, walletConnectWallet] :
        // Android wallet order when in browser
        isAndroid ?
          [trustWallet, metaMaskWallet, walletConnectWallet, rainbowWallet] :
        // Desktop order
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

// Handle deep links on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Handle Trust Wallet deep links
    if (window.location.href.includes('wc?uri=')) {
      const uri = decodeURIComponent(window.location.href.split('wc?uri=')[1]);
      window.location.href = `trust://wc?uri=${uri}`;
    }
    
    // We're not automatically clearing walletconnect sessions anymore
    // as it was causing refresh loops
  });
}

export const config = createConfig({
  connectors,
  chains: [bsc],
  transports: {
    [bsc.id]: http(),
  },
  // Add proper disconnect handling
  storage: typeof window !== 'undefined'
    ? {
        ...createStorage({
          storage: window.localStorage,
        }),
        onDisconnect: () => {
          // Clear WalletConnect session on disconnect
          if (window.localStorage.getItem('walletconnect')) {
            window.localStorage.removeItem('walletconnect');
          }
        },
      }
    : undefined,
});