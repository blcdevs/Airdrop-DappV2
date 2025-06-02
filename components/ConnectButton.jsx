import { ConnectButton } from "@rainbow-me/rainbowkit";

export const CustomConnectButton = () => {
  return (
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

        const handleConnect = () => {
          // Check if we're in a browser environment
          if (typeof window === 'undefined') {
            // Server-side rendering, just open modal directly
            openConnectModal();
            return;
          }
          
          // Check if iOS device
          const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
          const isAndroid = /Android/i.test(navigator.userAgent);
          
          if (isIOS || isAndroid) {
            // Check if a wallet is already installed
            const isMetaMaskInstalled = !!window.ethereum?.isMetaMask;
            const isTrustWalletInstalled = !!window.ethereum?.isTrust;
            const isCoinbaseWalletInstalled = !!window.ethereum?.isCoinbaseWallet;
            
            if (isIOS) {
              // iOS specific handling - use a small delay and force modal to render properly
              setTimeout(() => {
                // Open the connect modal - DON'T clear localStorage or it causes refresh loops
                openConnectModal();
                
                // For iOS Safari, we need to ensure the modal is properly focused
                setTimeout(() => {
                  const modalElement = document.querySelector('[role="dialog"]');
                  if (modalElement) {
                    modalElement.setAttribute('tabindex', '-1');
                    modalElement.focus();
                  }
                }, 300);
              }, 50);
            } else if (isMetaMaskInstalled || isTrustWalletInstalled || isCoinbaseWalletInstalled) {
              // Use detected wallets on Android
              setTimeout(openConnectModal, 100);
            } else {
              // Fallback to WalletConnect QR code
              openConnectModal();
            }
          } else {
            // Desktop or non-mobile browser
            openConnectModal();
          }
        };

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
                  <button
                    onClick={handleConnect}
                    className="bg-[#E0AD6B] hover:bg-[#eba447] text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Connect Wallet
                  </button>
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
  );
};