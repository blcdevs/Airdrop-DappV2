import React, { useState, useEffect } from 'react';
import { useWeb3 } from "../context/Web3Context";
import { useNotification } from "../context/NotificationContext";
import { 
  getDeviceInfo, 
  checkWalletInstallation, 
  getTokenDeepLink,
  openTokenInMultipleWallets
} from "../utils/walletHelpers";

const AddTokenButton = ({ className }) => {
  const { showNotification } = useNotification();
  const { provider } = useWeb3();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
  const tokenSymbol = "TNTC";
  const tokenDecimals = 18;
  const tokenImage = "https://thetinseltoken.com/assets/images/logo.png";

  // Create token info object for deep links
  const tokenInfo = {
    address: tokenAddress,
    symbol: tokenSymbol,
    decimals: tokenDecimals,
    image: tokenImage
  };

  // Device detection
  const deviceInfo = getDeviceInfo();
  const walletInfo = checkWalletInstallation();

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

  // Direct attempt to add token using provider method
  const addTokenViaProvider = async () => {
    try {
      const provider = window.ethereum;
      if (!provider) throw new Error("No wallet provider detected");
      
      const wasAdded = await provider.request({
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
        showNotification("Token added to wallet successfully!", "success");
        return true;
      } else {
        throw new Error("User rejected the request");
      }
    } catch (error) {
      console.error("Error adding token via provider:", error);
      return false;
    }
  };

  const addTokenToWallet = async () => {
    try {
      setIsLoading(true);
      setLoadingText("Connecting to wallet...");
      setShowError(false);
      
      // For mobile devices, directly try deep linking to wallet apps for the best experience
      if (deviceInfo.isMobile) {
        // First check if there's an injected provider
        if (window.ethereum) {
          try {
            // Try direct method first (works great on Android)
            const success = await addTokenViaProvider();
            if (success) {
              setIsLoading(false);
              return;
            }
          } catch (err) {
            console.log("Injected provider error, trying deep links:", err);
          }
        }
        
        // If no provider or provider method failed, try deep links
        setLoadingText("Opening wallet app...");
        
        // For iOS we'll try multiple wallets in sequence
        // For Android we'll use the most common wallet
        openTokenInMultipleWallets(tokenInfo);
        
        // Hide loading indicator after a short delay
        setTimeout(() => {
          setIsLoading(false);
          showNotification("Opening wallet to add token...", "info");
        }, 1000);
        return;
      } 
      
      // For desktop, use the provider method
      if (window.ethereum) {
        const success = await addTokenViaProvider();
        if (success) {
          setIsLoading(false);
          return;
        }
      }
      
      // If we reach here, automatic methods failed
      setShowError(true);
      setErrorMessage("Couldn't add token automatically. Please copy the address and add it manually to your wallet.");
      setIsLoading(false);
      copyToClipboard();
    } catch (error) {
      console.error("Add token error:", error);
      setShowError(true);
      setErrorMessage(error.message || "Failed to add token to wallet. Please try adding manually.");
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
              {loadingText}
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
      
      {/* Error message if token addition fails */}
      {showError && (
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
            <i className="fas fa-exclamation-circle"></i>
            <span>{errorMessage}</span>
          </div>
          <div className="mt-2">
            <button
              onClick={copyToClipboard}
              className="btn btn-sm"
              style={{
                background: 'rgba(255, 128, 191, 0.2)',
                color: '#ff80bf',
                border: 'none',
                padding: '4px 10px',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '15px'
              }}
            >
              <i className="fas fa-copy me-1"></i> Copy Address
            </button>
          </div>
        </div>
      )}
      
      {/* Info banner for first-time users */}
      {deviceInfo.isMobile && !showError && (
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