import React, { useState, useEffect } from 'react';
import { useWeb3 } from "../context/Web3Context";
import { useNotification } from "../context/NotificationContext";

const AddTokenButton = ({ className }) => {
  const { showNotification } = useNotification();
  const { provider } = useWeb3();
  const [copied, setCopied] = useState(false);
  const [showMobileOptions, setShowMobileOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");

  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
  const tokenSymbol = "TNTC";
  const tokenDecimals = 18;
  const tokenImage = "https://thetinseltoken.com/assets/images/logo.png";

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
          setLoadingText("Initializing wallet connection...");
        } else if (loadingProgress < 60) {
          setLoadingText("Preparing token details...");
        } else {
          setLoadingText("Waiting for wallet confirmation...");
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

  const openWalletLink = (link) => {
    // Create an iframe to open the link to avoid browser history changes
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Try to open the wallet
    iframe.src = link;
    
    // Clean up after a delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  const addTokenToWallet = async () => {
    try {
      setIsLoading(true);
      
      if (isMobileDevice()) {
        // For mobile browsers
        const availableProviders = [];
        
        // Check for injected providers
        if (window.ethereum) availableProviders.push('metamask');
        if (window.trustwallet) availableProviders.push('trustwallet');
        if (window.coinbaseWallet) availableProviders.push('coinbase');
        
        // If we have an injected provider, try to use it
        if (availableProviders.length > 0) {
          // Prioritize detected providers
          let walletProvider = window.ethereum || 
                              window.trustwallet || 
                              window.coinbaseWallet;
          
          try {
            // Complete the progress bar animation
            setLoadingProgress(90);
            setLoadingText("Opening wallet app...");
            
            const wasAdded = await walletProvider.request({
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
            setLoadingText("Confirmed!");
            
            // Slight delay before hiding loading indicator
            setTimeout(() => {
              setIsLoading(false);

        if (wasAdded) {
          showNotification("Token added to wallet successfully!", "success");
              }
            }, 500);
            
            return;
          } catch (injectedError) {
            console.error("Error with injected provider:", injectedError);
            // Fall through to show mobile options if the injected provider fails
          }
        }
        
        // If no provider or provider failed, complete loading animation first then show options
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          // If no provider or provider failed, show wallet selection options
          setShowMobileOptions(true);
          showNotification("Please select your wallet app to add the token", "info");
        }, 500);
        
      } else {
        // Desktop browser handling
        const provider = window.ethereum;

        if (!provider) {
          setLoadingProgress(100);
          setTimeout(() => {
            setIsLoading(false);
            showNotification("Please install a Web3 wallet extension like MetaMask", "error");
          }, 500);
          return;
        }

        try {
          // Complete the progress bar animation
          setLoadingProgress(90);
          setLoadingText("Opening wallet extension...");

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

          // Complete loading animation
          setLoadingProgress(100);
          setLoadingText("Confirmed!");
          
          // Hide loading after a short delay
          setTimeout(() => {
            setIsLoading(false);

        if (wasAdded) {
          showNotification("Token added to wallet successfully!", "success");
        } else {
              showNotification("You declined to add the token", "info");
            }
          }, 500);
          
        } catch (error) {
          // Complete loading animation
          setLoadingProgress(100);
          
          setTimeout(() => {
            setIsLoading(false);
            
            if (error.code === 4001) {
              showNotification("You declined to add the token", "info");
            } else {
              showNotification("Error adding token to wallet", "error");
              console.error("Add token error:", error);
            }
          }, 500);
        }
      }
    } catch (error) {
      // Complete loading animation
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsLoading(false);
        console.error("Add token general error:", error);
      showNotification(error.message || "Error adding token to wallet", "error");
      }, 500);
    }
  };

  const handleWalletSelection = (walletType) => {
    setIsLoading(true);
    setLoadingText("Opening wallet app...");
    
    const userAgent = navigator.userAgent.toLowerCase();
    let walletLink = '';
    
    if (userAgent.includes("android")) {
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
        case 'tokenpocket':
          walletLink = `https://tokenpocket.pro/add-token?address=${tokenAddress}&symbol=${tokenSymbol}&decimals=${tokenDecimals}&chain=BSC`;
          break;
        case 'manual':
          copyToClipboard();
          setIsLoading(false);
          showNotification("Address copied. Add token manually in your wallet.", "info");
          setShowMobileOptions(false);
          return;
      }
    } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
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
        case 'manual':
          copyToClipboard();
          setIsLoading(false);
          showNotification("Address copied. Add token manually in your wallet.", "info");
          setShowMobileOptions(false);
          return;
      }
    }
    
    if (walletLink) {
      // Try to open the wallet using the link
      window.location.href = walletLink;
      
      // Also open in iframe as fallback
      openWalletLink(walletLink);
      
      // Set a timeout to check if the wallet opened
      setTimeout(() => {
        setIsLoading(false);
        showNotification("If your wallet didn't open, you may need to install it first", "info");
      }, 2000);
    } else {
      setIsLoading(false);
    }
    
    setShowMobileOptions(false);
  };

  const closeMobileOptions = () => {
    setShowMobileOptions(false);
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
      
      {/* Mobile Wallet Selection Dialog */}
      {showMobileOptions && (
        <div className="position-fixed top-0 start-0 end-0 bottom-0" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="bg-white rounded shadow" style={{
            width: '100%',
            maxWidth: '350px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0 fw-bold" style={{ color: '#4f46e5' }}>
                <i className="fas fa-wallet me-2"></i>
                Add to Wallet
              </h5>
              <button 
                className="btn btn-sm text-secondary border-0" 
                onClick={closeMobileOptions}
                style={{ 
                  width: '32px', 
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-3 bg-light border-bottom">
              <div className="d-flex align-items-center gap-2 mb-2">
                <div style={{
                  width: '40px', 
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-coins text-white"></i>
                </div>
                <div>
                  <div className="fw-bold">{tokenSymbol}</div>
                  <div className="small text-secondary">{tokenAddress.substring(0, 8)}...{tokenAddress.substring(tokenAddress.length - 8)}</div>
                </div>
              </div>
            </div>
            
            <div className="p-3">
              <p className="text-secondary small mb-3">Select your wallet app to add the TNTC token:</p>
              
              <div className="d-grid gap-2 mb-3">
                <button 
                  className="btn btn-outline-primary d-flex align-items-center p-3" 
                  onClick={() => handleWalletSelection('metamask')}
                  style={{ borderRadius: '0.75rem' }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <img 
                      src="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png" 
                      width="32" 
                      height="32"
                      alt="MetaMask" 
                    />
                  </div>
                  <div className="text-start">
                    <div className="fw-bold">MetaMask</div>
                    <div className="small text-secondary">Most popular wallet</div>
                  </div>
                </button>
                
                <button 
                  className="btn btn-outline-primary d-flex align-items-center p-3" 
                  onClick={() => handleWalletSelection('trust')}
                  style={{ borderRadius: '0.75rem' }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <img 
                      src="https://trustwallet.com/assets/images/favicon.png" 
                      width="32" 
                      height="32"
                      alt="Trust Wallet" 
                    />
                  </div>
                  <div className="text-start">
                    <div className="fw-bold">Trust Wallet</div>
                    <div className="small text-secondary">Best for mobile</div>
                  </div>
                </button>
                
                <button 
                  className="btn btn-outline-primary d-flex align-items-center p-3" 
                  onClick={() => handleWalletSelection('coinbase')}
                  style={{ borderRadius: '0.75rem' }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <img 
                      src="https://www.coinbase.com/img/favicon/favicon-32.png" 
                      width="32" 
                      height="32"
                      alt="Coinbase Wallet" 
                    />
                  </div>
                  <div className="text-start">
                    <div className="fw-bold">Coinbase Wallet</div>
                    <div className="small text-secondary">Easy to use</div>
                  </div>
                </button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-secondary small mb-2">Don't have these wallets?</p>
                <button 
                  className="btn btn-secondary d-flex align-items-center justify-content-center mx-auto" 
                  onClick={() => handleWalletSelection('manual')}
                  style={{ borderRadius: '0.5rem' }}
                >
                  <i className="fas fa-copy me-2"></i>
                  Copy Address for Manual Addition
                </button>
              </div>
            </div>
            
            <div className="p-3 bg-light border-top">
              <p className="text-secondary small mb-0 text-center">
                <i className="fas fa-info-circle me-1"></i>
                If you don't have a wallet installed, you'll need to download and install one first.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTokenButton;