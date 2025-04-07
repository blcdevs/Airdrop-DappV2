import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getWalletDownloadLinks, checkWalletInstallation } from '../utils/walletHelpers';
import { useConnectModal } from '@rainbow-me/rainbowkit';

const MobileWalletOptions = ({ onDismiss }) => {
  const { isIOSDevice, isMobileDevice } = useWeb3();
  const { openConnectModal } = useConnectModal();
  const [downloadLinks, setDownloadLinks] = useState({});
  const [installedWallets, setInstalledWallets] = useState({
    hasInjectedProvider: false,
    isMetaMask: false,
    isTrust: false
  });
  
  useEffect(() => {
    if (isMobileDevice) {
      setDownloadLinks(getWalletDownloadLinks());
      setInstalledWallets(checkWalletInstallation());
    }
  }, [isMobileDevice]);
  
  const handleConnectWallet = () => {
    openConnectModal();
    if (onDismiss) onDismiss();
  };
  
  if (!isMobileDevice) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 rounded-xl p-6 w-11/12 max-w-md relative">
        <button 
          onClick={onDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <h2 className="text-xl font-bold text-white mb-6 text-center">Wallet Connection Help</h2>
        
        {installedWallets.hasInjectedProvider ? (
          <div className="mb-6">
            <h3 className="text-lg text-white mb-3">Detected Wallet</h3>
            <button
              onClick={handleConnectWallet}
              className="w-full bg-[#E0AD6B] hover:bg-[#d8953d] text-white py-3 px-4 rounded-lg font-medium mb-2 flex items-center justify-center"
            >
              <span>Open Standard Connection Dialog</span>
            </button>
            <p className="text-sm text-gray-400">Use the wallet that's installed in your browser</p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-amber-400 text-sm mb-4">
              No wallet detected in your browser. Install one of the recommended wallets below.
            </p>
          </div>
        )}
        
        <div>
          <h3 className="text-lg text-white mb-3">Install a Wallet</h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={downloadLinks.metamask}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex flex-col items-center transition duration-200"
            >
              <img src="https://thetinseltoken.com/assets/images/metamask.png" alt="MetaMask" className="w-12 h-12 mb-2" />
              <span className="text-sm text-white font-medium">MetaMask</span>
            </a>
            
            <a
              href={downloadLinks.trust}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex flex-col items-center transition duration-200"
            >
              <img src="https://thetinseltoken.com/assets/images/trustwallet.png" alt="Trust Wallet" className="w-12 h-12 mb-2" />
              <span className="text-sm text-white font-medium">Trust Wallet</span>
            </a>
            
            {isIOSDevice && (
              <a
                href={downloadLinks.rainbow}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex flex-col items-center transition duration-200"
              >
                <img src="https://thetinseltoken.com/assets/images/rainbow.png" alt="Rainbow" className="w-12 h-12 mb-2" />
                <span className="text-sm text-white font-medium">Rainbow</span>
              </a>
            )}
            
            <a
              href={downloadLinks.coinbase}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex flex-col items-center transition duration-200"
            >
              <img src="https://thetinseltoken.com/assets/images/coinbase.png" alt="Coinbase Wallet" className="w-12 h-12 mb-2" />
              <span className="text-sm text-white font-medium">Coinbase Wallet</span>
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            After installing a wallet, return to this page and click "Connect Wallet" again.
          </p>
          
          <button
            onClick={handleConnectWallet}
            className="w-full mt-4 bg-[#E0AD6B] hover:bg-[#d8953d] text-white py-2 px-4 rounded-lg font-medium"
          >
            Open Standard Connection Dialog
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileWalletOptions; 