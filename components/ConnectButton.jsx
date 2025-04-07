import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWeb3 } from "../context/Web3Context";
import { useState, useEffect } from "react";
import MobileWalletOptions from "./MobileWalletOptions";

export const CustomConnectButton = () => {
  const { 
    isConnected, 
    connectWallet, 
    connectionError, 
    isMobileDevice, 
    isIOSDevice 
  } = useWeb3();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showMobileOptions, setShowMobileOptions] = useState(false);

  // Clear error message after 5 seconds
  useEffect(() => {
    let timer;
    if (connectionError) {
      setShowError(true);
      timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [connectionError]);

  // For devices that need special handling (like iOS)
  const getWalletAppLinks = () => {
    if (!isMobileDevice) return null;
    
    return (
      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={() => setShowMobileOptions(true)}
          className="text-sm text-gray-500 hover:text-[#E0AD6B] hover:underline flex items-center justify-center"
          style={{
            padding: "8px 16px",
            border: "1px dashed #ccc",
            borderRadius: "20px",
            background: "transparent"
          }}
        >
          <i className="fas fa-question-circle mr-2"></i>
          Need help connecting? Click here
        </button>
      </div>
    );
  };

  return (
    <>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <div className="flex flex-col items-center">
                      <button
                        onClick={openConnectModal}
                        disabled={isConnecting}
                        className={`bg-[#E0AD6B] hover:bg-[#eba447] text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 
                          ${isConnecting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        style={{
                          boxShadow: "0 4px 14px rgba(224, 173, 107, 0.4)",
                          minWidth: "220px"
                        }}
                      >
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                      </button>
                      
                      {showError && connectionError && (
                        <div className="mt-2 text-red-500 text-sm bg-red-100 p-2 rounded">
                          {connectionError}
                        </div>
                      )}
                      
                      {getWalletAppLinks()}
                    </div>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
                    >
                      Wrong network
                    </button>
                  );
                }

                return (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={openChainModal}
                      className="bg-[#E0AD6B] hover:bg-[#d8953d] text-[#1A1A1A] px-4 py-2 rounded-lg flex items-center gap-2 mr-2"
                    >
                      {chain.hasIcon && (
                        <div className="w-5 h-5 ">
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              className="w-5 h-5"
                            />
                          )}
                        </div>
                      )}
                    </button>

                    <button
                      onClick={openAccountModal}
                      className="bg-[#E0AD6B] hover:bg-[#d8953d] text-[#1A1A1A] px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      {account.displayName}
                      {account.displayBalance && ` (${account.displayBalance})`}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>

      {/* Mobile wallet options dialog - only shown when help button is clicked */}
      {showMobileOptions && (
        <MobileWalletOptions onDismiss={() => setShowMobileOptions(false)} />
      )}
    </>
  );
};