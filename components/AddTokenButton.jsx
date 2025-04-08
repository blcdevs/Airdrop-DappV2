import React, { useState, useEffect } from 'react';
import { useWeb3 } from "../context/Web3Context";
import { useNotification } from "../context/NotificationContext";
import { useAccount, useConnect, useConnectorClient } from "wagmi";

const AddTokenButton = ({ className }) => {
  const { showNotification } = useNotification();
  const { provider, signer } = useWeb3();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get wallet connection info from Wagmi
  const { address, connector: activeConnector, isConnected } = useAccount();
  const { connectors } = useConnect();
  const { data: connectorClient } = useConnectorClient();

  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
  const tokenSymbol = "TNTC";
  const tokenDecimals = 18;
  const tokenImage = "https://thetinseltoken.com/assets/images/logo.png";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tokenAddress);
      setCopied(true);
      showNotification("Contract address copied!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showNotification("Failed to copy address", "error");
    }
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Detect wallet type based on connector and browser
  const detectWalletType = () => {
    // First check the active connector
    if (activeConnector) {
      const connectorId = activeConnector.id.toLowerCase();
      if (connectorId.includes('metamask')) return 'metamask';
      if (connectorId.includes('trust')) return 'trust';
      if (connectorId.includes('coinbase')) return 'coinbase';
      if (connectorId.includes('rainbow')) return 'rainbow';
    }
    
    // If no specific connector match, check browser user agent
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('trust')) return 'trust';
    if (userAgent.includes('metamask')) return 'metamask';
    if (userAgent.includes('coinbase')) return 'coinbase';
    if (userAgent.includes('rainbow')) return 'rainbow';
    
    // If still not identified and on mobile, default to Trust Wallet
    if (isMobileDevice()) return 'trust';
    
    // Default to metamask for desktop
    return 'metamask';
  };

  // Direct deep linking to wallet apps
  const openWalletForToken = (walletType) => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = userAgent.includes("android");
    const isIOS = userAgent.includes("iphone") || userAgent.includes("ipad");
    let walletLink = '';
    
    if (isAndroid) {
      // Android deep links
      switch (walletType) {
        case 'trust':
          walletLink = `https://link.trustwallet.com/add_token?asset=c20000714_t${tokenAddress}`;
          break;
        case 'metamask':
          walletLink = `https://metamask.app.link/add-token?address=${tokenAddress}&symbol=${tokenSymbol}&decimals=${tokenDecimals}`;
          break;
        case 'coinbase':
          walletLink = `https://wallet.coinbase.com/add-token?address=${tokenAddress}&symbol=${tokenSymbol}&decimals=${tokenDecimals}&chain=BSC`;
          break;
        default:
          walletLink = '';
      }
    } else if (isIOS) {
      // iOS deep links
      switch (walletType) {
        case 'trust':
          walletLink = `trust://add_token?address=${tokenAddress}&symbol=${tokenSymbol}&decimals=${tokenDecimals}`;
          break;
        case 'metamask':
          walletLink = `metamask://add-token?address=${tokenAddress}&symbol=${tokenSymbol}&decimals=${tokenDecimals}`;
          break;
        case 'coinbase':
          walletLink = `coinbase://add-token?address=${tokenAddress}&symbol=${tokenSymbol}&decimals=${tokenDecimals}`;
          break;
        case 'rainbow':
          walletLink = `rainbow://add-token?address=${tokenAddress}&symbol=${tokenSymbol}&decimals=${tokenDecimals}`;
          break;
        default:
          walletLink = '';
      }
    }
    
    if (walletLink) {
      window.location.href = walletLink;
      // Also create a hidden iframe to attempt to open the app if the primary method fails
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.src = walletLink;
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
    
    return !!walletLink;
  };

  const addTokenToWallet = async () => {
    try {
      setIsLoading(true);
      
      if (!isConnected) {
        showNotification("Please connect your wallet first", "error");
        setIsLoading(false);
        return;
      }
      
      // Mobile handling with direct wallet deep links
      if (isMobileDevice()) {
        const walletType = detectWalletType();
        const opened = openWalletForToken(walletType);
        
        if (opened) {
          showNotification("Opening wallet app to add token...", "info");
          
          // Set a timeout to show help message if there's no confirmation
          setTimeout(() => {
            setIsLoading(false);
          }, 2000);
          return;
        }
      }
      
      // Try using the connected wallet provider directly through EIP-747
      if (window.ethereum) {
        try {
          showNotification("Opening wallet to add token...", "info");
          
          const wasAdded = await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: tokenAddress,
                symbol: tokenSymbol,
                decimals: tokenDecimals,
                image: tokenImage,
              },
            },
          });
          
          if (wasAdded) {
            showNotification("TNTC token added to your wallet successfully!", "success");
          } else {
            showNotification("You declined to add the token", "info");
          }
        } catch (error) {
          console.error("Error adding token:", error);
          
          // Try to detect if this is a mobile in-app browser that doesn't support the method
          if (isMobileDevice() && window.ethereum) {
            const walletType = detectWalletType();
            const opened = openWalletForToken(walletType);
            
            if (opened) {
              showNotification("Opening wallet app to add token...", "info");
            } else {
              copyToClipboard();
              showNotification("Could not add automatically. Address copied - please add manually in your wallet.", "info");
            }
          } else {
            copyToClipboard();
            showNotification("Could not add token. Address copied for manual addition.", "error");
          }
        }
      } else {
        // Fallback for browsers without injected provider
        copyToClipboard();
        showNotification("No wallet detected. Address copied to clipboard for manual addition.", "info");
      }
    } catch (error) {
      console.error("Add token error:", error);
      copyToClipboard();
      showNotification("Error adding token. Address copied for manual addition.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="position-relative">
      <div className="d-flex" style={{ width: '100%', gap: '10px' }}>
        <button
          onClick={addTokenToWallet}
          className={`${isLoading ? 'disabled' : ''}`}
          disabled={isLoading}
          style={{
            flex: '1',
            padding: '12px 20px',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to right, #ff80bf, #ffaa80)',
            border: 'none',
            borderRadius: '30px',
            color: 'white',
            cursor: 'pointer',
            minWidth: '220px',
            whiteSpace: 'nowrap',
            gap: '8px'
          }}
        >
          {isLoading ? (
            <span className="d-flex align-items-center">
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Adding token...
            </span>
          ) : (
            <span className="d-flex align-items-center">
              <i className="fas fa-wallet me-2"></i>
              ADD TNTC TO WALLET
            </span>
          )}
        </button>
        <button
          onClick={copyToClipboard}
          title="Copy contract address to add manually to wallet"
          disabled={isLoading}
          style={{
            padding: '12px 20px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to right, #ff80bf, #ffaa80)',
            border: 'none',
            borderRadius: '30px',
            color: 'white',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            width: '100px'
          }}
        >
          <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} me-2`}></i>
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
      
      {/* Add a banner for mobile devices to explain what this does */}
      {isMobileDevice() && (
        <div 
          className="mt-3 p-3 rounded"
          style={{
            backgroundColor: 'rgba(255, 128, 191, 0.1)',
            border: '1px solid rgba(255, 128, 191, 0.2)',
            fontSize: '0.9rem',
            color: '#ff80bf'
          }}
        >
          <div className="d-flex gap-2 align-items-center">
            <i className="fas fa-info-circle"></i>
            <span>Adding token enables you to see your TNTC balance in your wallet app</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTokenButton;