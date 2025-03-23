import { createConfig, http } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
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

// Check if we're in a mobile environment
const isMobile = typeof navigator !== 'undefined' ? 
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : 
  false;

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
            chainId: `0x${bscTestnet.id.toString(16)}`,
            chainName: bscTestnet.name,
            nativeCurrency: bscTestnet.nativeCurrency,
            rpcUrls: [bscTestnet.rpcUrls.default.http[0]],
            blockExplorerUrls: [bscTestnet.blockExplorers.default.url],
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
    chains: [bscTestnet],
    initialChain: bscTestnet.id,
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
    
    // Handle WalletConnect session recovery
    if (localStorage.getItem('walletconnect')) {
      try {
        const session = JSON.parse(localStorage.getItem('walletconnect'));
        if (session && !session.connected) {
          localStorage.removeItem('walletconnect');
        }
      } catch (e) {
        console.log('Error parsing WalletConnect session:', e);
        localStorage.removeItem('walletconnect');
      }
    }
  });
}

export const config = createConfig({
  connectors,
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http(),
  },
});