import React, { useState, useEffect } from 'react';
import { useWeb3 } from "../context/Web3Context";
import { useNotification } from "../context/NotificationContext";
import { useAccount, useConnectorClient } from 'wagmi';

const AddTokenButton = ({ className }) => {
  const { showNotification } = useNotification();
  const { provider, contract, signer } = useWeb3();
  const { connector } = useAccount();
  const { data: connectorClient } = useConnectorClient();
  
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");
  const [connectedWalletType, setConnectedWalletType] = useState(null);

  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
  const tokenSymbol = "TNTC";
  const tokenDecimals = 18;
  const tokenImage = "https://thetinseltoken.com/assets/images/logo.png";

  // Detect the connected wallet type
  useEffect(() => {
    if (connector) {
      // Get wallet information from the connector
      const walletName = connector.name?.toLowerCase() || '';

      if (walletName.includes('metamask')) {
        setConnectedWalletType('metamask');
      } else if (walletName.includes('trust')) {
        setConnectedWalletType('trust');
      } else if (walletName.includes('coinbase')) {
        setConnectedWalletType('coinbase');
      } else if (walletName.includes('wallet connect')) {
        // WalletConnect - need to determine the actual wallet app
        detectWalletConnectProvider();
      } else {
        // Default to 'unknown' wallet
        setConnectedWalletType('unknown');
      }
      
      console.log("Detected wallet type:", walletName);
    }
  }, [connector]);

  // Detect the specific WalletConnect provider (for mobile wallets)
  const detectWalletConnectProvider = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('trust')) {
      setConnectedWalletType('trust');
    } else if (userAgent.includes('metamask')) {
      setConnectedWalletType('metamask');
    } else if (userAgent.includes('coinbase')) {
      setConnectedWalletType('coinbase');
    } else if (userAgent.includes('rainbow')) {
      setConnectedWalletType('rainbow');
    } else {
      // Default to generic 'walletconnect'
      setConnectedWalletType('walletconnect');
    }
  };

  // Reset loading progress when loading state changes to false
  useEffect(() => {
    if (!isLoading) {
      setLoadingProgress(0);
    }
  }, [isLoading]);

  // Progress animation
  useEffect(() => {
    let progressInterval;
    
    if (isLoading) {
      // Animate the progress
      progressInterval = setInterval(() => {
        setLoadingProgress(prevProgress => {
          // Increase slowly until 80%, then pause to wait for actual response
          if (prevProgress < 80) {
            return prevProgress + (Math.random() * 2);
          }
          return prevProgress;
        });
        
        // Update loading text based on progress
        if (loadingProgress < 30) {
          setLoadingText("Connecting to wallet...");
        } else if (loadingProgress < 60) {
          setLoadingText("Preparing token details...");
        } else {
          setLoadingText("Opening wallet app...");
        }
      }, 100);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading, loadingProgress]);

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

  // Generate deep link based on wallet type and platform
  const getWalletDeepLink = (walletType) => {
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const encodedTokenAddress = encodeURIComponent(tokenAddress);
    
    switch (walletType) {
      case 'trust':
        return isAndroid 
          ? `https://link.trustwallet.com/add_token?asset=c20000714_t${tokenAddress}`
          : `trust://add_token?address=${tokenAddress}&symbol=${tokenSymbol}&decimals=${tokenDecimals}`;
      case 'metamask':
        return isAndroid
          ? `https://metamask.app.link/add-token?address=${tokenAddress}&symbol=${tokenSymbol}&decimals=${tokenDecimals}`
          : `metamask://add-token?address=${tokenAddress}&symbol=${tokenSymbol}&decimals=${tokenDecimals}`;
      case 'coinbase':
        return `https://wallet.coinbase.com/add-token?address=${tokenAddress}&symbol=${tokenSymbol}&decimals=${tokenDecimals}&chain=BSC`;
      case 'rainbow':
        return `rainbow://add-token?address=${tokenAddress}&symbol=${tokenSymbol}&decimals=${tokenDecimals}`;
      default:
        return null;
    }
  };

  // Direct method to add token to connected wallet
  const addTokenDirectly = async () => {
    try {
      setIsLoading(true);
      setLoadingText("Connecting to wallet...");
      
      // If we have window.ethereum (MetaMask or other injected providers)
      if (window.ethereum) {
        try {
          setLoadingProgress(40);
          setLoadingText("Requesting wallet to add token...");
          
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
          
          setLoadingProgress(100);
          
          setTimeout(() => {
            setIsLoading(false);
            if (wasAdded) {
              showNotification("Token added to wallet successfully!", "success");
            } else {
              showNotification("You declined to add the token", "info");
            }
          }, 500);
          return;
        } catch (error) {
          // Will try other methods if this fails
          console.log("Error with injected provider, trying alternative methods", error);
        }
      }
      
      // Use WalletConnect provider if available
      if (connectorClient?.provider) {
        try {
          setLoadingProgress(40);
          setLoadingText("Requesting wallet to add token...");
          
          // Try the WalletConnect compatible way to add a token
          if (connectorClient.provider.request) {
            const wasAdded = await connectorClient.provider.request({
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
            
            setLoadingProgress(100);
            
            setTimeout(() => {
              setIsLoading(false);
              if (wasAdded) {
                showNotification("Token added to wallet successfully!", "success");
              } else {
                showNotification("You declined to add the token", "info");
              }
            }, 500);
            return;
          }
        } catch (error) {
          console.log("Error with WalletConnect provider", error);
        }
      }
      
      // If on mobile, try deep linking as a fallback
      if (isMobileDevice() && connectedWalletType) {
        const deepLink = getWalletDeepLink(connectedWalletType);
        
        if (deepLink) {
          setLoadingProgress(70);
          setLoadingText("Opening wallet app...");
          
          // Try to open the deep link
          window.location.href = deepLink;
          
          // Show a completion message
          setTimeout(() => {
            setIsLoading(false);
            showNotification("Wallet app should be opening. Please check your wallet app.", "info");
          }, 1500);
          return;
        }
      }
      
      // If all else fails, offer to copy the address
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        copyToClipboard();
        showNotification("Could not automatically add token. Contract address copied - please add manually in your wallet.", "info");
      }, 500);
      
    } catch (error) {
      console.error("Add token error:", error);
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsLoading(false);
        copyToClipboard();
        showNotification("Error adding token. Contract address copied - please add manually in your wallet.", "error");
      }, 500);
    }
  };

  return (
    <div className="position-relative">
      <div className="d-flex" style={{ width: '100%', gap: '10px' }}>
        <button
          onClick={addTokenDirectly}
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
      
      {/* Loading Progress Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '320px',
            textAlign: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div className="mb-3">
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <i className="fas fa-wallet" style={{
                  fontSize: '2rem',
                  color: 'white'
                }}></i>
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Adding TNTC Token</h4>
              <p style={{ 
                margin: '0', 
                fontSize: '0.875rem', 
                color: '#6b7280',
                minHeight: '1.5rem'
              }}>{loadingText}</p>
            </div>
            
            <div style={{
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <div 
                style={{
                  height: '100%',
                  width: `${loadingProgress}%`,
                  background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
            
            <p style={{ 
              margin: '0', 
              fontSize: '0.75rem', 
              color: '#6b7280'
            }}>
              {loadingProgress < 90 ? 
                "Please wait for wallet popup..." : 
                "Please check your wallet app or extension"
              }
            </p>
            
            {loadingProgress > 90 && (
              <button 
                onClick={() => setIsLoading(false)} 
                style={{
                  marginTop: '1rem',
                  background: 'none',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTokenButton;