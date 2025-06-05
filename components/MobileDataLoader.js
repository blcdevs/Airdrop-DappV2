import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { isMobileBrowser } from '../utils/mobileUtils';

const MobileDataLoader = ({ children, fallback = null }) => {
  const { 
    isConnected, 
    contract, 
    isMobile, 
    mobileConnectionReady, 
    isInitializing,
    initError 
  } = useWeb3();
  
  const [showMobileLoader, setShowMobileLoader] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [retryAttempts, setRetryAttempts] = useState(0);

  useEffect(() => {
    setShowMobileLoader(isMobileBrowser());
  }, []);

  useEffect(() => {
    if (!showMobileLoader || !isConnected) {
      setLoadingMessage('');
      return;
    }

    if (isInitializing) {
      setLoadingMessage('Connecting to blockchain...');
      return;
    }

    if (initError) {
      setLoadingMessage('Connection failed. Retrying...');
      return;
    }

    if (!mobileConnectionReady) {
      setLoadingMessage('Preparing mobile connection...');
      return;
    }

    if (!contract) {
      setLoadingMessage('Loading smart contract...');
      return;
    }

    setLoadingMessage('');
  }, [showMobileLoader, isConnected, isInitializing, initError, mobileConnectionReady, contract]);

  const handleRetry = () => {
    setRetryAttempts(prev => prev + 1);
    
    // Force page refresh after multiple retries
    if (retryAttempts >= 2) {
      window.location.reload();
    }
  };

  // Show mobile loading state
  if (showMobileLoader && loadingMessage) {
    return (
      <div className="mobile-data-loader">
        <div className="loader-content">
          <div className="loader-spinner">
            <div className="spinner"></div>
          </div>
          <div className="loader-message">
            <h3>Loading...</h3>
            <p>{loadingMessage}</p>
            {initError && (
              <div className="loader-error">
                <p className="error-text">
                  Having trouble connecting on mobile browser
                </p>
                <button 
                  className="retry-button"
                  onClick={handleRetry}
                >
                  {retryAttempts >= 2 ? 'Refresh Page' : 'Retry'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <style jsx>{`
          .mobile-data-loader {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(26, 26, 26, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(10px);
          }
          
          .loader-content {
            text-align: center;
            color: white;
            max-width: 300px;
            padding: 2rem;
          }
          
          .loader-spinner {
            margin-bottom: 1.5rem;
          }
          
          .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #333;
            border-top: 3px solid #E0AD6B;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .loader-message h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.25rem;
            color: #E0AD6B;
          }
          
          .loader-message p {
            margin: 0 0 1rem 0;
            color: #ccc;
            font-size: 0.9rem;
          }
          
          .loader-error {
            margin-top: 1rem;
            padding: 1rem;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
          }
          
          .error-text {
            color: #fca5a5;
            font-size: 0.85rem;
            margin-bottom: 0.75rem;
          }
          
          .retry-button {
            background: #E0AD6B;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .retry-button:hover {
            background: #d9a05e;
          }
        `}</style>
      </div>
    );
  }

  // Show fallback if provided and still loading
  if (fallback && (isInitializing || !contract)) {
    return fallback;
  }

  // Render children when ready
  return children;
};

export default MobileDataLoader;
